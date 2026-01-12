'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function HomePage() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');
  const galleryImages = PlaceHolderImages.filter(img => img.id.startsWith('gallery-')).slice(0, 3);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] md:h-[80vh]">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            fill
            className="object-cover object-top"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="relative h-full flex flex-col items-center justify-end pb-12 md:pb-24 text-center text-foreground">
          <div className="container px-4 md:px-6 animation-fade-in">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
              Nova's Braid Bar
            </h1>
            <p className="mt-4 max-w-[700px] mx-auto text-muted-foreground md:text-xl">
              Exquisite Braiding, Unforgettable Style.
            </p>
            <div className="mt-6 flex flex-col gap-2 min-[400px]:flex-row justify-center">
              <Button asChild size="lg">
                <Link href="/appointments">
                  Book Your Session
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/services">
                  View Our Services
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Showcase */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Featured Styles</h2>
            <p className="max-w-[600px] mx-auto text-muted-foreground md:text-lg mt-4">
              Discover the artistry and precision in every braid we create.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {galleryImages.map((image) => (
              <div key={image.id} className="relative group overflow-hidden rounded-xl">
                <Image
                  src={encodeURI(image.imageUrl)}
                  alt={image.description}
                  data-ai-hint={image.imageHint}
                  width={400}
                  height={500}
                  className="object-cover w-full h-full aspect-[4/5] transition-transform duration-300 ease-in-out group-hover:scale-105"
                />
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <p className="text-white text-lg font-semibold">{image.description}</p>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-card">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              What Our Clients Say
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              We are proud to have the trust and loyalty of so many wonderful clients.
            </p>
          </div>
          <div className="mx-auto w-full max-w-sm space-y-2">
            <div className="flex justify-center space-x-1">
              <Star className="w-6 h-6 fill-primary text-primary" />
              <Star className="w-6 h-6 fill-primary text-primary" />
              <Star className="w-6 h-6 fill-primary text-primary" />
              <Star className="w-6 h-6 fill-primary text-primary" />
              <Star className="w-6 h-6 fill-primary text-primary" />
            </div>
            <p className="text-lg font-semibold">
              "Absolutely in love with my braids! Nova is professional, gentle, and incredibly talented. Best service in Ado-Ekiti!"
            </p>
            <p className="text-sm text-muted-foreground">- Happy Client</p>
          </div>
        </div>
      </section>
    </div>
  );
}
