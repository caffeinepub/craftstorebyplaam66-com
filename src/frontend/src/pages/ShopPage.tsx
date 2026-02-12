import { useMemo } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useFilters } from '../storefront/filtersStore';
import ProductCard from '../components/products/ProductCard';
import { Loader2 } from 'lucide-react';

export default function ShopPage() {
  const { data: products = [], isLoading } = useProducts();
  const { searchText, selectedCategory } = useFilters();

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !searchText ||
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.description.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchText, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <section className="relative h-[300px] overflow-hidden bg-muted md:h-[400px]">
        <img
          src="/assets/generated/craftstore-hero.dim_1600x600.png"
          alt="Handcrafted Products"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="text-center text-white">
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-6xl">
              Handcrafted with Love
            </h1>
            <p className="text-lg md:text-xl">Discover unique artisan products</p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
            <p className="text-lg text-muted-foreground">No products found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">
                {selectedCategory || 'All Products'}{' '}
                <span className="text-muted-foreground">({filteredProducts.length})</span>
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
