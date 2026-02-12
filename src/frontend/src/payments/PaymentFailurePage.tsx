import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { XCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useActor } from '../hooks/useActor';
import { PaymentStatus } from '../backend';

export default function PaymentFailurePage() {
  const navigate = useNavigate();
  const { actor } = useActor();

  useEffect(() => {
    const updateOrderStatus = async () => {
      const orderId = sessionStorage.getItem('pendingOrderId');
      if (orderId && actor) {
        try {
          await actor.updateOrderPaymentStatus(orderId, PaymentStatus.failed);
        } catch (error) {
          console.error('Failed to update order status:', error);
        }
      }
    };

    updateOrderStatus();
  }, [actor]);

  const handleRetry = () => {
    const orderId = sessionStorage.getItem('pendingOrderId');
    if (orderId) {
      navigate({ to: '/order/$orderId', params: { orderId } });
    } else {
      navigate({ to: '/checkout' });
    }
  };

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <XCircle className="mb-4 h-16 w-16 text-destructive" />
      <h1 className="mb-2 text-3xl font-bold">Payment Failed</h1>
      <p className="mb-6 text-muted-foreground">
        Your payment was not completed. Please try again or contact support if the issue persists.
      </p>
      <div className="flex gap-4">
        <Button onClick={handleRetry}>Try Again</Button>
        <Button variant="outline" onClick={() => navigate({ to: '/' })}>
          Back to Shop
        </Button>
      </div>
    </div>
  );
}
