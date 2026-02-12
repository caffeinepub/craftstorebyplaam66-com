import { useParams, useNavigate } from '@tanstack/react-router';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { useOrder } from '../hooks/useOrder';
import { formatPrice } from '../utils/money';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';

export default function OrderConfirmationPage() {
  const { orderId } = useParams({ from: '/order/$orderId' });
  const { data: order, isLoading } = useOrder(orderId);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4">
        <p className="mb-4 text-lg text-muted-foreground">Order not found</p>
        <Button onClick={() => navigate({ to: '/' })}>Back to Shop</Button>
      </div>
    );
  }

  const getPaymentStatusIcon = () => {
    switch (order.paymentStatus) {
      case 'paid':
        return <CheckCircle className="h-12 w-12 text-green-600" />;
      case 'failed':
        return <XCircle className="h-12 w-12 text-destructive" />;
      default:
        return <Clock className="h-12 w-12 text-yellow-600" />;
    }
  };

  const getPaymentStatusText = () => {
    switch (order.paymentStatus) {
      case 'paid':
        return 'Payment Successful';
      case 'failed':
        return 'Payment Failed';
      default:
        return 'Payment Pending';
    }
  };

  const getPaymentStatusBadge = () => {
    switch (order.paymentStatus) {
      case 'paid':
        return <Badge className="bg-green-600">Paid</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Status Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">{getPaymentStatusIcon()}</div>
          <h1 className="mb-2 text-3xl font-bold">{getPaymentStatusText()}</h1>
          <p className="text-muted-foreground">Order ID: {order.id}</p>
        </div>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Order Details</CardTitle>
              {getPaymentStatusBadge()}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold">Customer Information</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Name:</span> {order.customer.name}
                </p>
                <p>
                  <span className="text-muted-foreground">Email:</span> {order.customer.email}
                </p>
                <p>
                  <span className="text-muted-foreground">Phone:</span> {order.customer.phone}
                </p>
                <p>
                  <span className="text-muted-foreground">Shipping Address:</span>{' '}
                  {order.customer.shippingAddress}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="mb-2 font-semibold">Order Items</h3>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      Product ID: {item.productId} × {Number(item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-semibold">
              <span>Total Amount</span>
              <span>{formatPrice(Number(order.totalAmount))}</span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button onClick={() => navigate({ to: '/' })} variant="outline">
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
