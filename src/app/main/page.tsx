'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';

type Service = {
    id: string;
    name: string;
    description: string;
    image: (typeof PlaceHolderImages)[0];
}

const services: Service[] = [
    {
        id: 'knotless-braids',
        name: 'Knotless Braids',
        description: 'Protective styles done with precision, care, and beauty.',
        image: PlaceHolderImages.find(img => img.id === 'service-knotless')!
    },
    {
        id: 'boho-braids',
        name: 'Boho Braids',
        description: 'Protective styles done with precision, care, and beauty.',
        image: PlaceHolderImages.find(img => img.id === 'service-boho')!
    },
    {
        id: 'cornrows',
        name: 'Cornrows',
        description: 'Protective styles done with precision, care, and beauty.',
        image: PlaceHolderImages.find(img => img.id === 'service-cornrows')!
    },
    {
        id: 'kids-braids',
        name: 'Kids Braids',
        description: 'Protective styles done with precision, care, and beauty.',
        image: PlaceHolderImages.find(img => img.id === 'service-kids')!
    },
]

const galleryImages = PlaceHolderImages.filter(img => img.id.startsWith('gallery-'));
const heroMainImage = PlaceHolderImages.find(img => img.id === 'hero-main');
const heroSecondaryImage = PlaceHolderImages.find(img => img.id === 'hero-secondary');

export default function MainPage() {

  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="container mx-auto py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 text-center md:text-left">
            <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight">
              Nova's Braid Game
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-light">
              Where every braid is a masterpiece.
            </p>
            <Button size="lg" asChild>
              <Link href="/appointments">Book Appointment</Link>
            </Button>
          </div>
          {heroMainImage && (
            <div className="relative h-80 md:h-[500px] rounded-lg overflow-hidden">
                 <Image
                    src={heroMainImage.imageUrl}
                    alt={heroMainImage.description}
                    data-ai-hint={heroMainImage.imageHint}
                    fill
                    className="object-cover"
                />
            </div>
          )}
        </div>
      </section>

      {/* Second Section with Image and Services */}
      <section className="container mx-auto py-12 md:py-24">
        <div className="grid md:grid-cols-5 gap-8 lg:gap-16 items-start">
          {heroSecondaryImage && (
              <div className="md:col-span-2 relative h-96 md:h-full rounded-lg overflow-hidden">
                <Image
                    src={heroSecondaryImage.imageUrl}
                    alt={heroSecondaryImage.description}
                    data-ai-hint={heroSecondaryImage.imageHint}
                    fill
                    className="object-cover"
                />
              </div>
          )}
          <div className="md:col-span-3">
            <div className="mb-8">
                <h2 className="font-headline text-4xl md:text-5xl font-bold">Our Services</h2>
                <p className="text-lg text-muted-foreground mt-2">Protective styles done with precision, care, and beauty.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-6">
                {services.map(service => (
                    <Link href="/services" key={service.id} className="group">
                        <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
                             <Image
                                src={service.image.imageUrl}
                                alt={service.image.description}
                                data-ai-hint={service.image.imageHint}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                        <h3 className="font-headline text-xl font-medium text-center">{service.name}</h3>
                    </Link>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Third Section - Stunning Braids */}
       <section className="container mx-auto py-12 md:py-24">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="space-y-4">
                <h2 className="font-headline text-4xl md:text-5xl font-bold">Stunning Braids for Every Beauty</h2>
                <p className="text-muted-foreground text-lg">
                    From trendy Knotless Braids to Boho and everything-between, Nova's Braid Game is your go-to for flawless, long-lasting braids. Book your appointment today, and let your hair shine.
                </p>
                <Button size="lg" variant="outline" asChild>
                    <Link href="/services">
                        View Styles
                        <Plus className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
             <div className="grid grid-cols-3 gap-2 md:gap-4">
                {galleryImages.map((image, index) => (
                    <div key={image.id} className={`relative aspect-square rounded-lg overflow-hidden ${index === 1 ? 'row-span-2' : ''}`}>
                         <Image
                            src={image.imageUrl}
                            alt={image.description}
                            data-ai-hint={image.imageHint}
                            fill
                            className="object-cover"
                        />
                    </div>
                ))}
            </div>
        </div>
       </section>

       <footer className="container mx-auto py-8 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Nova's Braid Game. All rights reserved.</p>
       </footer>
    </div>
  );
}
