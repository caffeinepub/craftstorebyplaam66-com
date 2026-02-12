import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useActor } from '../hooks/useActor';
import { PaymentStatus } from '../backend';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processPaymentSuccess = async () => {
      try {
        const orderId = sessionStorage.getItem('pendingOrderId');
        if (!orderId) {
          toast.error('Order ID not found');
          navigate({ to: '/' });
          return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');

        if (sessionId && actor) {
          try {
            const sessionStatus = await actor.getStripeSessionStatus(sessionId);
            if (sessionStatus.__kind__ === 'completed') {
              await actor.updateOrderPaymentStatus(orderId, PaymentStatus.paid);
            }
          } catch (error) {
            console.error('Failed to verify payment status:', error);
          }
        }

        sessionStorage.removeItem('pendingOrderId');
        navigate({ to: '/order/$orderId', params: { orderId } });
      } catch (error) {
        console.error('Payment processing error:', error);
        toast.error('Failed to process payment confirmation');
        navigate({ to: '/' });
      } finally {
        setIsProcessing(false);
      }
    };

    processPaymentSuccess();
  }, [actor, navigate]);

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4">
      <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
      <p className="text-lg text-muted-foreground">Processing your payment...</p>
    </div>
  );
}
