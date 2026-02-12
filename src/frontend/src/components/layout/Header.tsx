import { Link, useNavigate } from '@tanstack/react-router';
import { ShoppingCart, Search, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../../cart/CartProvider';
import { getTotalItemCount } from '../../cart/cartTypes';
import { useFilters } from '../../storefront/filtersStore';
import { useCategories } from '../../hooks/useCategories';
import { useIsAdmin } from '../../hooks/useIsAdmin';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '../ui/sheet';

export default function Header() {
  const { items } = useCart();
  const itemCount = getTotalItemCount(items);
  const { searchText, setSearchText, selectedCategory, setSelectedCategory } = useFilters();
  const { data: categories = [] } = useCategories();
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { identity } = useInternetIdentity();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const showAdminLink = isAuthenticated && isAdmin && !adminLoading;

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
    setMobileMenuOpen(false);
    navigate({ to: '/' });
  };

  const handleClearFilters = () => {
    setSearchText('');
    setSelectedCategory(null);
  };

  const navLinks = [
    { to: '/', label: 'Shop' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img
              src="/assets/generated/craftstore-logo.dim_512x256.png"
              alt="Craft Store"
              className="h-8 w-auto md:h-10"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            {showAdminLink && (
              <Link
                to="/admin/products"
                className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Manage Products
              </Link>
            )}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden flex-1 max-w-md md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Category Filter - Desktop */}
          {categories.length > 0 && (
            <div className="hidden items-center gap-2 md:flex">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                </Button>
              ))}
              {(searchText || selectedCategory) && (
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  Clear
                </Button>
              )}
            </div>
          )}

          {/* Cart & Mobile Menu */}
          <div className="flex items-center gap-2">
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-6 py-6">
                  {/* Mobile Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search products..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Mobile Categories */}
                  {categories.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-sm font-semibold">Categories</h3>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                          <Button
                            key={category}
                            variant={selectedCategory === category ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleCategoryClick(category)}
                          >
                            {category}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {(searchText || selectedCategory) && (
                    <Button variant="outline" onClick={handleClearFilters}>
                      Clear Filters
                    </Button>
                  )}

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col gap-2">
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.to}>
                        <Link to={link.to}>
                          <Button variant="ghost" className="w-full justify-start">
                            {link.label}
                          </Button>
                        </Link>
                      </SheetClose>
                    ))}
                    {showAdminLink && (
                      <SheetClose asChild>
                        <Link to="/admin/products">
                          <Button variant="ghost" className="w-full justify-start text-primary">
                            Manage Products
                          </Button>
                        </Link>
                      </SheetClose>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
