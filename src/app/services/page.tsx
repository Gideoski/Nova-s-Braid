
'use client';

import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ServiceCategory } from '@/lib/types';
import { Loader2, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const formatPrice = (price: number) => {
  return `₦${price.toLocaleString()}`;
};

export default function ServicesPage() {
  const firestore = useFirestore();
  
  const categoriesRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'serviceCategories');
  }, [firestore]);

  const { data: categories, isLoading } = useCollection<ServiceCategory>(categoriesRef);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold">No services found.</h1>
        <p className="mt-2 text-muted-foreground">Check the admin dashboard to initialize services.</p>
        <Button asChild className="mt-4">
          <Link href="/admin">Go to Admin Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-primary uppercase">Our Services</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Find the perfect braiding style for you.
        </p>
      </div>

      <Tabs defaultValue={categories[0].id} className="w-full">
        <div className="overflow-x-auto pb-4">
          <TabsList className="inline-flex w-max min-w-full md:grid md:grid-cols-4 lg:grid-cols-7 mb-8">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id!} className="px-6">
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id!}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {category.services.map((service) => (
                <Card key={service.name} className="flex flex-col relative overflow-hidden group">
                  {service.originalPrice && service.originalPrice > service.price && (
                    <div className="absolute top-4 right-[-35px] rotate-45 bg-primary text-primary-foreground text-[10px] font-bold py-1 w-[120px] text-center shadow-sm">
                      {Math.round((1 - service.price / service.originalPrice) * 100)}% OFF
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="pr-12">{service.name}</CardTitle>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-3xl font-bold text-primary">
                        {formatPrice(service.price)}
                      </span>
                      {service.originalPrice && service.originalPrice > service.price && (
                        <span className="text-sm line-through text-muted-foreground/60 decoration-primary/40 decoration-1">
                          {formatPrice(service.originalPrice)}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    {/* Descriptions could be added to the entity in backend.json if needed */}
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href="/appointments">Book Now</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
