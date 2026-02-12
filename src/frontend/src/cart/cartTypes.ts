import type { Product } from '../backend';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
}

export function calculateLineTotal(item: CartItem): number {
  return Number(item.product.priceInCents) * item.quantity;
}

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
}

export function calculateTotal(items: CartItem[]): number {
  return calculateSubtotal(items);
}

export function getTotalItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
