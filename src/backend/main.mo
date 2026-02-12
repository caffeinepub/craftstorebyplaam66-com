import Stripe "stripe/stripe";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import OutCall "http-outcalls/outcall";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type Product = {
    id : Text;
    name : Text;
    description : Text;
    priceInCents : Nat;
    category : Text;
    imageRef : Text;
    stock : Nat;
  };

  public type CustomerDetails = {
    name : Text;
    email : Text;
    phone : Text;
    shippingAddress : Text;
  };

  public type PaymentStatus = {
    #paid;
    #pending;
    #failed;
  };

  public type Order = {
    id : Text;
    owner : Principal;
    customer : CustomerDetails;
    items : [OrderedItem];
    totalAmount : Nat;
    stripeSessionId : ?Text;
    paymentStatus : PaymentStatus;
  };

  public type OrderedItem = {
    productId : Text;
    quantity : Nat;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
    shippingAddress : Text;
  };

  let productCatalog = Map.empty<Text, Product>();
  let orderMap = Map.empty<Text, Order>();
  let categories = Map.empty<Text, Bool>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let sessionToOrder = Map.empty<Text, Text>();

  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Product Management (Admin-only)
  public shared ({ caller }) func addProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    productCatalog.add(product.id, product);
    categories.add(product.category, true);
  };

  // Product Catalog (Public access - no auth required)
  public query ({ caller }) func getProducts() : async [Product] {
    productCatalog.values().toArray();
  };

  public query ({ caller }) func getProductById(id : Text) : async Product {
    switch (productCatalog.get(id)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?product) { product };
    };
  };

  public query ({ caller }) func getCategories() : async [Text] {
    categories.keys().toArray();
  };

  // Order processing (Authenticated users only)
  public shared ({ caller }) func createOrder(customer : CustomerDetails, items : [OrderedItem], totalAmount : Nat) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };
    let orderId = caller.toText() # "-" # totalAmount.toText();
    let order : Order = {
      id = orderId;
      owner = caller;
      customer;
      items;
      totalAmount;
      stripeSessionId = null;
      paymentStatus = #pending;
    };
    orderMap.add(orderId, order);
    orderId;
  };

  public query ({ caller }) func getOrder(orderId : Text) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    switch (orderMap.get(orderId)) {
      case (null) { Runtime.trap("Order does not exist") };
      case (?order) {
        // Users can only see their own orders, admins can see all
        if (order.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        order;
      };
    };
  };

  public query ({ caller }) func getPendingOrdersForCustomer(email : Text) : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    let ordersIter = orderMap.values();
    let allOrders = ordersIter.toArray();

    // Filter orders: user can only see their own, admin can see all matching email
    allOrders.filter(func(order) {
      let matchesEmail = order.customer.email == email and order.paymentStatus == #pending;
      let hasAccess = order.owner == caller or AccessControl.isAdmin(accessControlState, caller);
      matchesEmail and hasAccess;
    });
  };

  // Payment configuration (Admin-only)
  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };
    stripeConfiguration := ?config;
  };

  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe is not configured") };
      case (?config) { config };
    };
  };

  // Payment processing (Authenticated users, ownership verified)
  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can initiate payment");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  func updateOrderWithSessionId(orderId : Text, sessionId : Text) {
    switch (orderMap.get(orderId)) {
      case (null) { Runtime.trap("Order does not exist") };
      case (?order) {
        let updatedOrder = { order with stripeSessionId = ?sessionId };
        orderMap.add(orderId, updatedOrder);
      };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func updateOrderPaymentStatus(orderId : Text, status : PaymentStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update payment status");
    };

    switch (orderMap.get(orderId)) {
      case (null) { Runtime.trap("Order does not exist") };
      case (?order) {
        // Verify ownership
        if (order.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own orders");
        };
        let updatedOrder = { order with paymentStatus = status };
        orderMap.add(orderId, updatedOrder);
      };
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Catalog seeding (Admin-only)
  public shared ({ caller }) func seedCatalog() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can seed catalog");
    };

    let exampleProducts : [Product] = [
      {
        id = "bangle-1";
        name = "Handmade Silver Bangle";
        description = "Elegant bangle crafted from 925 silver, stone inlay work.";
        priceInCents = 2999;
        category = "Jewelry";
        imageRef = "bangle-silver.jpg";
        stock = 10;
      },
      {
        id = "clutch-1";
        name = "Embroidered Silk Clutch";
        description = "Vibrant handmade silk clutch purse with traditional floral patterns.";
        priceInCents = 1599;
        category = "Accessories";
        imageRef = "clutch-silk.jpg";
        stock = 7;
      },
      {
        id = "earrings-1";
        name = "Terracotta Earrings";
        description = "Eco-friendly earrings made from natural terracotta clay, unique designs.";
        priceInCents = 899;
        category = "Jewelry";
        imageRef = "earrings-terracotta.jpg";
        stock = 15;
      },
      {
        id = "bangle-2";
        name = "Golden Bangle Set";
        description = "Traditional Indian bangle set with intricate gold plating, includes 6 bangles.";
        priceInCents = 3499;
        category = "Jewelry";
        imageRef = "bangle-gold.jpg";
        stock = 8;
      },
      {
        id = "bracelet-1";
        name = "Beaded Chakra Bracelet";
        description = "Handmade bracelet with semi-precious stone beads, chakra healing properties.";
        priceInCents = 1199;
        category = "Accessories";
        imageRef = "bracelet-beads.jpg";
        stock = 12;
      },
    ];

    let jewelryCats = Map.empty<Text, Bool>();
    jewelryCats.add("Jewelry", true);
    jewelryCats.add("Accessories", true);

    let productMap = Map.empty<Text, Product>();
    for (product in exampleProducts.values()) {
      productMap.add(product.id, product);
    };

    // Add entries from productMap to productCatalog
    for (entry in productMap.entries()) {
      switch (entry) {
        case ((id, product)) {
          productCatalog.add(id, product);
        };
      };
    };

    // Add entries from jewelryCats to categories
    for (entry in jewelryCats.entries()) {
      switch (entry) {
        case ((category, bool)) {
          categories.add(category, bool);
        };
      };
    };
  };
};
