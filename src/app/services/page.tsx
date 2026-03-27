
'use client';

import Link from 'next/link';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ServiceCategory } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const formatPrice = (price: number) => {
  return `₦${price.toLocaleString()}`;
};

export default function ServicesPage() {
  const firestore = useFirestore();
  const categoriesRef = collection(firestore, 'serviceCategories');
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
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-primary">Our Services</h1>
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
                <Card key={service.name} className="flex flex-col">
                  <CardHeader>
                    <CardTitle>{service.name}</CardTitle>
                    <CardDescription className="text-2xl font-bold text-primary mt-2">
                      {formatPrice(service.price)}
                    </CardDescription>
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
