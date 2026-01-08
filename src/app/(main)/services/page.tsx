import Link from 'next/link';
import { serviceCategories } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const formatPrice = (price: number) => {
  return `₦${price.toLocaleString()}`;
};

export default function ServicesPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Our Services</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Find the perfect braiding style for you.
        </p>
      </div>

      <Tabs defaultValue={serviceCategories[0].id} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 mb-8">
          {serviceCategories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {serviceCategories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {category.services.map((service) => (
                <Card key={service.name}>
                  <CardHeader>
                    <CardTitle>{service.name}</CardTitle>
                    <CardDescription className="text-2xl font-bold text-primary">
                      {formatPrice(service.price)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Placeholder for future descriptions */}
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
