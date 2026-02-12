# Specification

## Summary
**Goal:** Let the store owner (admin) add new products—including an uploaded image—from the live website.

**Planned changes:**
- Add an admin-only Product Management route (e.g., `/admin/products`) that requires Internet Identity login and blocks non-admin users with a clear message.
- Add an admin product creation form with fields: name, description, priceInCents, category, stock, and image.
- Implement image selection in the form (PNG/JPEG), show a preview, and save the chosen file as a data URL into `product.imageRef` (while keeping existing fallback behavior when no image is chosen).
- Update product image rendering so `imageRef` supports: data URLs, http/https URLs, or existing filename-to-generated-asset mapping.
- Add an admin-only navigation entry (“Admin” / “Manage Products”) in header and mobile menu linking to the admin product page.
- Add a short in-page “How to add products” help section explaining required fields, price in cents (example), stock behavior, and image upload/preview.
- Ensure newly added products appear in the Shop product list without a manual refresh (invalidate/refetch after successful add).

**User-visible outcome:** Admin users can sign in, open an admin product page from the site navigation, fill out a form (optionally selecting an image with preview), submit to add a new product, and immediately see it appear in the shop; non-admin users cannot access or see the admin entry points.
