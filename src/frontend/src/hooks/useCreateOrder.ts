import { useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { CustomerDetails, OrderedItem } from '../backend';

export function useCreateOrder() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      customer,
      items,
      totalAmount,
    }: {
      customer: CustomerDetails;
      items: OrderedItem[];
      totalAmount: number;
    }): Promise<string> => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrder(customer, items, BigInt(totalAmount));
    },
  });
}
