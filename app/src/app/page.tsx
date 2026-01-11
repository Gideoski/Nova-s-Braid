'use client';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { MainNav } from "@/components/main-nav";
import { Logo } from "@/components/logo";


export default function HomePage() {
  const galleryImages = PlaceHolderImages.filter(img => img.id.startsWith('gallery-'));
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-background/95 backdrop-blur-sm sticky top-0 z-50 w-full border-b">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-auto flex items-center gap-2">
            <Logo />
          </Link>
          <MainNav />
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-card">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Available for all kinds of braids
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Location: ABUAD, Ado-Ekiti
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/services">
                      Explore Services
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg">
                    <Link href="/appointments">
                      Book Now
                    </Link>
                  </Button>
                </div>
              </div>
               <Image
                src={heroImage?.imageUrl || "https://picsum.photos/seed/hero/600/600"}
                width={600}
                height={600}
                alt={heroImage?.description || "Hero"}
                data-ai-hint={heroImage?.imageHint || "braided hairstyle"}
                className="mx-auto aspect-square overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Our Work</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {galleryImages.map((image) => (
                <Card key={image.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative aspect-[4/5]">
                      <Image
                        src={encodeURI(image.imageUrl)}
                        alt={image.description}
                        data-ai-hint={image.imageHint}
                        fill
                        className="object-cover transition-transform duration-300 ease-in-out hover:scale-105"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
