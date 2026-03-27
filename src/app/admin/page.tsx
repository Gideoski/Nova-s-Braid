
'use client';

import { useState } from 'react';
import { useCollection, useFirestore, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Edit3, Save, X, RotateCcw, Percent } from 'lucide-react';
import { ServiceCategory, Service } from '@/lib/types';
import { serviceCategories as initialData } from '@/lib/data';

export default function AdminDashboard() {
  const firestore = useFirestore();
  const categoriesRef = collection(firestore, 'serviceCategories');
  const { data: categories, isLoading } = useCollection<ServiceCategory>(categoriesRef);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingService, setEditingService] = useState<{ catId: string; serviceIndex: number; name: string; price: string } | null>(null);
  const [newStyle, setNewStyle] = useState<{ catId: string; name: string; price: string } | null>(null);
  const [discount, setDiscount] = useState<{ catId: string; percentage: string } | null>(null);

  const handleSeedData = () => {
    if (!firestore) return;
    initialData.forEach((cat) => {
      const catRef = doc(firestore, 'serviceCategories', cat.id);
      setDocumentNonBlocking(catRef, { name: cat.name, services: cat.services }, { merge: true });
    });
  };

  const addCategory = () => {
    if (!newCategoryName || !firestore) return;
    const catId = newCategoryName.toLowerCase().replace(/\s+/g, '-');
    const catRef = doc(firestore, 'serviceCategories', catId);
    setDocumentNonBlocking(catRef, { name: newCategoryName, services: [] }, { merge: true });
    setNewCategoryName('');
  };

  const deleteCategory = (id: string) => {
    if (!firestore) return;
    const catRef = doc(firestore, 'serviceCategories', id);
    deleteDocumentNonBlocking(catRef);
  };

  const addStyle = (catId: string) => {
    if (!newStyle || !firestore || !categories) return;
    const category = categories.find(c => c.id === catId);
    if (!category) return;

    const updatedServices = [...category.services, { name: newStyle.name, price: Number(newStyle.price) }];
    const catRef = doc(firestore, 'serviceCategories', catId);
    setDocumentNonBlocking(catRef, { ...category, services: updatedServices }, { merge: true });
    setNewStyle(null);
  };

  const deleteStyle = (catId: string, serviceIndex: number) => {
    if (!firestore || !categories) return;
    const category = categories.find(c => c.id === catId);
    if (!category) return;

    const updatedServices = category.services.filter((_, i) => i !== serviceIndex);
    const catRef = doc(firestore, 'serviceCategories', catId);
    setDocumentNonBlocking(catRef, { ...category, services: updatedServices }, { merge: true });
  };

  const saveEditedService = () => {
    if (!editingService || !firestore || !categories) return;
    const category = categories.find(c => c.id === editingService.catId);
    if (!category) return;

    const updatedServices = [...category.services];
    updatedServices[editingService.serviceIndex] = {
      name: editingService.name,
      price: Number(editingService.price)
    };

    const catRef = doc(firestore, 'serviceCategories', editingService.catId);
    setDocumentNonBlocking(catRef, { ...category, services: updatedServices }, { merge: true });
    setEditingService(null);
  };

  const applyDiscount = (catId: string) => {
    if (!discount || !firestore || !categories) return;
    const category = categories.find(c => c.id === catId);
    if (!category) return;

    const percentage = Number(discount.percentage);
    const multiplier = (100 - percentage) / 100;

    const updatedServices = category.services.map(s => ({
      ...s,
      price: Math.round(s.price * multiplier)
    }));

    const catRef = doc(firestore, 'serviceCategories', catId);
    setDocumentNonBlocking(catRef, { ...category, services: updatedServices }, { merge: true });
    setDiscount(null);
  };

  if (isLoading) return <div className="p-12 text-center">Loading dashboard...</div>;

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your services, prices, and styles.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" onClick={handleSeedData}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Initialize Services
          </Button>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Add New Category */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Category</CardTitle>
            <CardDescription>Create a new group for your styles (e.g., "Wigs", "Treatments")</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Input 
              placeholder="Category Name" 
              value={newCategoryName} 
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <Button onClick={addCategory}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </CardContent>
        </Card>

        {/* Categories List */}
        {categories?.map((category) => (
          <Card key={category.id} className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-2xl">{category.name}</CardTitle>
                <CardDescription>{category.services.length} styles in this category</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setDiscount({ catId: category.id, percentage: '' })}
                >
                  <Percent className="mr-2 h-4 w-4" />
                  Discount
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => deleteCategory(category.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {discount?.catId === category.id && (
                <div className="bg-accent p-4 rounded-lg mb-4 flex items-center gap-4">
                  <Label>Discount Percentage (%):</Label>
                  <Input 
                    type="number" 
                    className="w-24" 
                    value={discount.percentage} 
                    onChange={e => setDiscount({ ...discount, percentage: e.target.value })}
                  />
                  <Button size="sm" onClick={() => applyDiscount(category.id)}>Apply</Button>
                  <Button size="sm" variant="ghost" onClick={() => setDiscount(null)}>Cancel</Button>
                </div>
              )}

              <div className="grid gap-2">
                {category.services.map((service, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-md bg-secondary/50 group">
                    {editingService?.catId === category.id && editingService.serviceIndex === idx ? (
                      <div className="flex flex-1 gap-2 items-center">
                        <Input 
                          value={editingService.name} 
                          onChange={e => setEditingService({...editingService, name: e.target.value})}
                          className="flex-1"
                        />
                        <Input 
                          type="number"
                          value={editingService.price} 
                          onChange={e => setEditingService({...editingService, price: e.target.value})}
                          className="w-32"
                        />
                        <Button size="icon" onClick={saveEditedService}><Save className="h-4 w-4"/></Button>
                        <Button size="icon" variant="ghost" onClick={() => setEditingService(null)}><X className="h-4 w-4"/></Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <span className="font-medium">{service.name}</span>
                          <span className="ml-4 text-primary font-bold">₦{service.price.toLocaleString()}</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setEditingService({ catId: category.id, serviceIndex: idx, name: service.name, price: service.price.toString() })}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => deleteStyle(category.id, idx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="bg-secondary/20 pt-4">
              {newStyle?.catId === category.id ? (
                <div className="flex w-full gap-2">
                  <Input 
                    placeholder="Style Name" 
                    className="flex-1"
                    value={newStyle.name}
                    onChange={e => setNewStyle({...newStyle, name: e.target.value})}
                  />
                  <Input 
                    type="number" 
                    placeholder="Price" 
                    className="w-32"
                    value={newStyle.price}
                    onChange={e => setNewStyle({...newStyle, price: e.target.value})}
                  />
                  <Button onClick={() => addStyle(category.id)}>Add Style</Button>
                  <Button variant="ghost" onClick={() => setNewStyle(null)}>Cancel</Button>
                </div>
              ) : (
                <Button variant="ghost" className="w-full border-dashed border-2" onClick={() => setNewStyle({ catId: category.id, name: '', price: '' })}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Style to {category.name}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
