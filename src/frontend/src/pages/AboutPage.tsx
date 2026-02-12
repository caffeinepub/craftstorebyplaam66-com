import { Card, CardContent } from '../components/ui/card';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-4xl font-bold">About Us</h1>

        <Card className="mb-6">
          <CardContent className="prose prose-neutral max-w-none p-6 dark:prose-invert">
            <h2>Our Story</h2>
            <p>
              Welcome to our handcrafted products store, where every piece tells a unique story of
              artistry and tradition. We are passionate about bringing you beautiful, handmade items
              that celebrate craftsmanship and creativity.
            </p>

            <h2>What We Offer</h2>
            <p>
              Our collection features a carefully curated selection of handcrafted products,
              including:
            </p>
            <ul>
              <li>Handmade jewelry - bangles, earrings, and bracelets</li>
              <li>Artisan accessories - clutches, bags, and more</li>
              <li>Unique handmade products crafted with love</li>
            </ul>

            <h2>Our Commitment</h2>
            <p>
              Each product in our store is made with attention to detail and a commitment to
              quality. We work with skilled artisans who pour their heart and soul into every piece,
              ensuring that you receive something truly special.
            </p>

            <p>
              Thank you for supporting handmade crafts and helping us keep traditional artistry
              alive.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
