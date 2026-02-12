# Specification

## Summary
**Goal:** Build a mobile-friendly handcrafted products storefront with product browsing, search/category filtering, cart, checkout, order confirmation, and Stripe payments.

**Planned changes:**
- Create storefront pages/routes: Home/Shop (listing), Product Details, Cart, Checkout, About, Contact, plus responsive header with category navigation and search.
- Implement product listing cards (image, name, price, Add to Cart) with example categories (bangles, accessories, handmade products).
- Add Product Details pages with larger image, description, category, and Add to Cart.
- Implement cart with add/view/edit (quantity/remove), subtotal/total, and persistence across refresh.
- Build checkout flow: cart review, customer details form (name, email, phone, shipping address), payment option selection, place order, and confirmation page with order ID and summary.
- Integrate Stripe Checkout; update and display payment status (Paid/Failed/Pending) on the confirmation page.
- Add backend catalog APIs: list products, get product by ID, list categories; seed example products with image references.
- Apply a consistent clean minimalist theme (white base, warm neutral accents) and ensure responsive, tap-friendly UI.
- Add generated static assets (logo, hero/banner, product images) under `frontend/public/assets/generated` and render them in the UI.

**User-visible outcome:** Users can browse and filter handcrafted products, view details, add items to a persistent cart, complete checkout with Stripe payment, and see an order confirmation with payment status.
