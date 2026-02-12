import { useParams, useNavigate } from '@tanstack/react-router';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { useProduct } from '../hooks/useProduct';
import { useCart } from '../cart/CartProvider';
import { formatPrice } from '../utils/money';
import { getProductImageUrl } from '../utils/productImages';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

export default function ProductDetailsPage() {
  const { productId } = useParams({ from: '/product/$productId' });
  const { data: product, isLoading, error } = useProduct(productId);
  const { addItem } = useCart();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4">
        <p className="text-lg text-muted-foreground">Product not found</p>
        <Button onClick={() => navigate({ to: '/' })} className="mt-4">
          Back to Shop
        </Button>
      </div>
    );
  }

  const imageUrl = getProductImageUrl(product.imageRef);

  const handleAddToCart = () => {
    addItem(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/' })}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Shop
      </Button>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Product Image */}
        <div className="overflow-hidden rounded-lg bg-muted">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <Badge className="mb-4 w-fit">{product.category}</Badge>
          <h1 className="mb-4 text-3xl font-bold md:text-4xl">{product.name}</h1>
          <p className="mb-6 text-3xl font-bold">{formatPrice(Number(product.priceInCents))}</p>
          <p className="mb-8 text-muted-foreground">{product.description}</p>

          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Stock: {Number(product.stock)} available
            </p>
          </div>

          <Button
            onClick={handleAddToCart}
            size="lg"
            className="w-full md:w-auto"
            disabled={Number(product.stock) === 0}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {Number(product.stock) === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
}
