import { useState } from 'react';
import { Button } from '../components/ui/button';
import { useCreateCheckoutSession } from './useCreateCheckoutSession';
import type { CartItem } from '../cart/cartTypes';
import type { ShoppingItem } from '../backend';
import { toast } from 'sonner';

interface PaymentButtonProps {
  orderId: string;
  items: CartItem[];
  onSuccess: () => void;
}

export default function PaymentButton({ orderId, items, onSuccess }: PaymentButtonProps) {
  const createCheckoutSession = useCreateCheckoutSession();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handlePayment = async () => {
    try {
      setIsRedirecting(true);

      const shoppingItems: ShoppingItem[] = items.map((item) => ({
        productName: item.product.name,
        productDescription: item.product.description,
        priceInCents: item.product.priceInCents,
        quantity: BigInt(item.quantity),
        currency: 'usd',
      }));

      const session = await createCheckoutSession.mutateAsync(shoppingItems);

      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }

      // Store order ID in session storage for payment return handling
      sessionStorage.setItem('pendingOrderId', orderId);

      // Redirect to Stripe Checkout
      window.location.href = session.url;
    } catch (error) {
      console.error('Payment initiation failed:', error);
      toast.error('Failed to initiate payment. Please try again.');
      setIsRedirecting(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      className="w-full"
      size="lg"
      disabled={createCheckoutSession.isPending || isRedirecting}
    >
      {isRedirecting ? 'Redirecting to Payment...' : 'Pay Now'}
    </Button>
  );
}
