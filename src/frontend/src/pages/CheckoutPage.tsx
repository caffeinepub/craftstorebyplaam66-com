import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCart } from '../cart/CartProvider';
import { calculateTotal } from '../cart/cartTypes';
import { formatPrice } from '../utils/money';
import { useCreateOrder } from '../hooks/useCreateOrder';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import type { CustomerDetails, OrderedItem } from '../backend';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import PaymentButton from '../payments/PaymentButton';
import PaymentSetupPanel from '../payments/PaymentSetupPanel';

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const navigate = useNavigate();
  const createOrder = useCreateOrder();
  const { identity, login, loginStatus } = useInternetIdentity();
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    email: '',
    phone: '',
    shippingAddress: '',
  });
  const [orderId, setOrderId] = useState<string | null>(null);

  const total = calculateTotal(items);
  const isAuthenticated = !!identity;

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4">
        <p className="mb-4 text-lg text-muted-foreground">Your cart is empty</p>
        <Button onClick={() => navigate({ to: '/' })}>Continue Shopping</Button>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!customerDetails.name || !customerDetails.email || !customerDetails.phone || !customerDetails.shippingAddress) {
      toast.error('Please fill in all customer details');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please log in to place an order');
      return;
    }

    try {
      const orderItems: OrderedItem[] = items.map((item) => ({
        productId: item.product.id,
        quantity: BigInt(item.quantity),
      }));

      const createdOrderId = await createOrder.mutateAsync({
        customer: customerDetails,
        items: orderItems,
        totalAmount: total,
      });

      setOrderId(createdOrderId);
      toast.success('Order created successfully!');
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error('Failed to create order. Please try again.');
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    if (orderId) {
      navigate({ to: '/order/$orderId', params: { orderId } });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Customer Details Form */}
        <div className="lg:col-span-2">
          {!isAuthenticated && (
            <Card className="mb-6 border-primary">
              <CardContent className="p-6">
                <p className="mb-4 text-sm">Please log in to place an order</p>
                <Button onClick={login} disabled={loginStatus === 'logging-in'}>
                  {loginStatus === 'logging-in' ? 'Logging in...' : 'Log In'}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={customerDetails.name}
                  onChange={(e) =>
                    setCustomerDetails({ ...customerDetails, name: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerDetails.email}
                  onChange={(e) =>
                    setCustomerDetails({ ...customerDetails, email: e.target.value })
                  }
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerDetails.phone}
                  onChange={(e) =>
                    setCustomerDetails({ ...customerDetails, phone: e.target.value })
                  }
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <Label htmlFor="address">Shipping Address *</Label>
                <Input
                  id="address"
                  value={customerDetails.shippingAddress}
                  onChange={(e) =>
                    setCustomerDetails({ ...customerDetails, shippingAddress: e.target.value })
                  }
                  placeholder="123 Main St, City, State, ZIP"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Setup Panel (Admin Only) */}
          <PaymentSetupPanel />
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span>
                      {item.product.name} × {item.quantity}
                    </span>
                    <span>{formatPrice(Number(item.product.priceInCents) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              {!orderId ? (
                <Button
                  onClick={handlePlaceOrder}
                  className="w-full"
                  size="lg"
                  disabled={!isAuthenticated || createOrder.isPending}
                >
                  {createOrder.isPending ? 'Creating Order...' : 'Place Order'}
                </Button>
              ) : (
                <PaymentButton
                  orderId={orderId}
                  items={items}
                  onSuccess={handlePaymentSuccess}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
