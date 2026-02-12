const IMAGE_MAP: Record<string, string> = {
  'bangle-silver.jpg': '/assets/generated/product-bangles-red.dim_800x800.png',
  'clutch-silk.jpg': '/assets/generated/product-accessories-mix.dim_800x800.png',
  'earrings-terracotta.jpg': '/assets/generated/product-accessories-mix.dim_800x800.png',
  'bangle-gold.jpg': '/assets/generated/product-bangles-red.dim_800x800.png',
  'bracelet-beads.jpg': '/assets/generated/product-accessories-mix.dim_800x800.png',
};

export function getProductImageUrl(imageRef: string): string {
  // Handle data URLs (uploaded images)
  if (imageRef.startsWith('data:')) {
    return imageRef;
  }
  
  // Handle http/https URLs
  if (imageRef.startsWith('http://') || imageRef.startsWith('https://')) {
    return imageRef;
  }
  
  // Handle mapped filenames (seeded products)
  return IMAGE_MAP[imageRef] || '/assets/generated/product-accessories-mix.dim_800x800.png';
}
