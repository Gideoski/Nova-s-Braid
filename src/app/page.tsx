'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  const galleryImages = PlaceHolderImages.filter(img => img.id.startsWith('gallery-'));

  return (
    <>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-card">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Available for all kinds of braids
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Location: ABUAD, Ado-Ekiti
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {galleryImages.map((image) => (
              <Card key={image.id} className="overflow-hidden group">
                <CardContent className="p-0">
                  <div className="relative aspect-square">
                    <Image
                      src={encodeURI(image.imageUrl)}
                      alt={image.description}
                      data-ai-hint={image.imageHint}
                      fill
                      className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
           <div className="text-center mt-12">
              <Button asChild size="lg">
                <Link href="/services">
                  Explore All Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
        </div>
      </section>
    </>
  );
}
