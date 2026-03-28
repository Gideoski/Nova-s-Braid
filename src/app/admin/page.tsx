'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCollection, useFirestore, useDoc, useMemoFirebase, useUser, useAuth } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Edit3, Save, X, RotateCcw, Percent, Tag, LogOut, Loader2, Users, LayoutDashboard, ShieldCheck, ShieldAlert, UserCog, UserMinus } from 'lucide-react';
import { ServiceCategory } from '@/lib/types';
import { serviceCategories as initialData } from '@/lib/data';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const ADMIN_EMAIL = 'gideonjackbara@gmail.com';

export default function AdminDashboard() {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const isAuthorized = isAdmin || (userData && userData.approved);

  const categoriesRef = useMemoFirebase(() => {
    if (!firestore || !user || !isAuthorized) return null;
    return collection(firestore, 'serviceCategories');
  }, [firestore, user, isAuthorized]);

  const adminsRef = useMemoFirebase(() => {
    if (!firestore || isUserLoading || !user || !isAuthorized) return null;
    return collection(firestore, 'users');
  }, [firestore, user, isAuthorized, isUserLoading]);

  const { data: categories, isLoading: isDataLoading } = useCollection<ServiceCategory>(categoriesRef);
  const { data: adminUsers, isLoading: isAdminsLoading } = useCollection<any>(adminsRef);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingService, setEditingService] = useState<{ catId: string; serviceIndex: number; name: string; price: string } | null>(null);
  const [newStyle, setNewStyle] = useState<{ catId: string; name: string; price: string } | null>(null);
  const [discount, setDiscount] = useState<{ catId: string; percentage: string } | null>(null);
  const [isUpdatingUser, setIsUpdatingUser] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/admin/login');
      return;
    }
    if (!isUserLoading && !isUserDataLoading && user) {
      if (!isAdmin && (!userData || !userData.approved)) {
        router.replace('/admin/login');
      }
    }
  }, [user, userData, isUserLoading, isUserDataLoading, router, isAdmin]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/admin/login');
  };

  const toggleUserApproval = async (uid: string, currentStatus: boolean, email: string) => {
    if (!firestore || isUpdatingUser) return;
    
    setIsUpdatingUser(uid);
    const userRef = doc(firestore, 'users', uid);
    const newStatus = !currentStatus;

    try {
      // Use setDoc directly to ensure it waits for the write or at least triggers it reliably
      await setDoc(userRef, { 
        approved: newStatus,
        email: email,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      toast({
        title: newStatus ? "User Approved" : "Access Revoked",
        description: `${email} permissions updated.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Update Failed",
        description: "Could not save permissions. Please try again.",
      });
    } finally {
      setIsUpdatingUser(null);
    }
  };

  const deleteUser = (uid: string) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', uid);
    deleteDocumentNonBlocking(userRef);
  };

  const resetAllOtherUsers = () => {
    if (!firestore || !adminUsers) return;
    adminUsers.forEach((admin: any) => {
      if (admin.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        const userRef = doc(firestore, 'users', admin.id);
        deleteDocumentNonBlocking(userRef);
      }
    });
    toast({
      title: "Directory Refreshed",
      description: "Permissions cleared. Users can now Login to appear as Pending again.",
    });
  };

  const handleSeedData = () => {
    if (!firestore) return;
    initialData.forEach((cat) => {
      const catRef = doc(firestore, 'serviceCategories', cat.id!);
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
      price: Number(editingService.price),
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
    const updatedServices = category.services.map(s => {
      const basePrice = s.originalPrice || s.price;
      return { ...s, originalPrice: basePrice, price: Math.round(basePrice * multiplier) };
    });
    const catRef = doc(firestore, 'serviceCategories', catId);
    setDocumentNonBlocking(catRef, { ...category, services: updatedServices }, { merge: true });
    setDiscount(null);
  };

  const clearDiscount = (catId: string) => {
    if (!firestore || !categories) return;
    const category = categories.find(c => c.id === catId);
    if (!category) return;
    const updatedServices = category.services.map(s => {
      const { originalPrice, ...rest } = s;
      return { ...rest, price: originalPrice || s.price };
    });
    const catRef = doc(firestore, 'serviceCategories', catId);
    setDocumentNonBlocking(catRef, { ...category, services: updatedServices }, { merge: true });
    setDiscount(null);
  };

  if (isUserLoading || (user && isUserDataLoading && !isAdmin)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const pendingCount = adminUsers?.filter((u: any) => !u.approved && u.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()).length || 0;

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary uppercase sparkle-text">Admin Center</h1>
          <p className="text-muted-foreground font-light italic mt-1">Operator: {user?.email}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-primary/20 hover:bg-primary/5" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-12 bg-secondary/50 p-1 border border-primary/10 h-14">
          <TabsTrigger value="services" className="text-lg py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold transition-all">
            <LayoutDashboard className="mr-2 h-5 w-5" />
            Services
          </TabsTrigger>
          <TabsTrigger value="access" className="text-lg py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold transition-all relative">
            <Users className="mr-2 h-5 w-5" />
            Admins
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center animate-bounce">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-8 animate-in fade-in duration-500">
          <div className="flex justify-between items-center bg-secondary/20 p-6 rounded-lg border border-primary/10">
            <div>
              <h2 className="text-xl font-bold text-primary uppercase tracking-wider">Service Management</h2>
              <p className="text-sm text-muted-foreground">Define your styles and categories</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/10 transition-colors">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restore Defaults
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-primary/20">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-primary font-bold uppercase">Restore default styles?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    This will overwrite current categories with the original salon baseline.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-secondary/50">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSeedData} className="bg-primary text-primary-foreground">Confirm</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg uppercase tracking-widest text-primary/80 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Category
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Input 
                placeholder="Category Name" 
                value={newCategoryName} 
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="bg-black/20 border-primary/10"
              />
              <Button onClick={addCategory} className="shadow-lg shadow-primary/20 font-bold">
                Add
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-8">
            {isDataLoading ? <div className="text-center p-12"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" /></div> : 
              categories?.map((category) => (
                <Card key={category.id} className="border-primary/20 overflow-hidden bg-card/40 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between bg-primary/5 border-b border-primary/10">
                    <div>
                      <CardTitle className="text-2xl font-bold text-primary uppercase tracking-tight">{category.name}</CardTitle>
                      <CardDescription className="font-mono text-[10px] uppercase tracking-widest mt-1">
                        {category.services.length} Styles
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="border-primary/20 h-9" onClick={() => setDiscount({ catId: category.id!, percentage: '' })}>
                        <Percent className="mr-2 h-4 w-4" />
                        Discount
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="h-9 w-9 p-0 bg-destructive/80 hover:bg-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card border-primary/20">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-destructive font-bold uppercase">Delete Category?</AlertDialogTitle>
                            <AlertDialogDescription className="text-muted-foreground">
                              Permanently remove "{category.name}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-secondary/50">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteCategory(category.id!)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {discount?.catId === category.id && (
                      <div className="bg-primary/5 p-4 rounded-lg mb-6 flex flex-col md:flex-row items-center gap-4 border border-primary/20 animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-2">
                          <Tag className="h-5 w-5 text-primary" />
                          <Label className="font-bold uppercase tracking-widest text-[10px]">Discount (%):</Label>
                          <Input type="number" className="w-24 bg-black/40 border-primary/20" value={discount.percentage} onChange={e => setDiscount({ ...discount, percentage: e.target.value })} />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => applyDiscount(category.id!)}>Apply</Button>
                          <Button size="sm" variant="outline" onClick={() => clearDiscount(category.id!)}>Reset</Button>
                          <Button size="sm" variant="ghost" onClick={() => setDiscount(null)}>Cancel</Button>
                        </div>
                      </div>
                    )}

                    <div className="grid gap-2">
                      {category.services.map((service, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 group border border-transparent hover:border-primary/20 transition-all">
                          {editingService?.catId === category.id && editingService.serviceIndex === idx ? (
                            <div className="flex flex-1 gap-4 items-center animate-in zoom-in-95">
                              <Input value={editingService.name} onChange={e => setEditingService({...editingService, name: e.target.value})} className="flex-1 bg-black/40" />
                              <div className="flex items-center gap-2">
                                <span className="text-primary font-bold">₦</span>
                                <Input type="number" value={editingService.price} onChange={e => setEditingService({...editingService, price: e.target.value})} className="w-32 bg-black/40" />
                              </div>
                              <Button size="icon" onClick={saveEditedService}><Save className="h-4 w-4"/></Button>
                              <Button size="icon" variant="ghost" onClick={() => setEditingService(null)}><X className="h-4 w-4"/></Button>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1 flex items-center gap-4">
                                <span className="font-semibold text-lg">{service.name}</span>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-primary font-bold text-lg">₦{service.price.toLocaleString()}</span>
                                  {service.originalPrice && service.originalPrice > service.price && (
                                    <span className="text-xs line-through text-muted-foreground/60">₦{service.originalPrice.toLocaleString()}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="hover:text-primary" onClick={() => setEditingService({ catId: category.id!, serviceIndex: idx, name: service.name, price: service.price.toString() })}>
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-card border-primary/20">
                                    <AlertDialogHeader><AlertDialogTitle className="text-destructive uppercase font-bold">Remove style?</AlertDialogTitle></AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="bg-secondary/50">Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteStyle(category.id!, idx)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="bg-secondary/10 py-4 border-t border-primary/10">
                    {newStyle?.catId === category.id ? (
                      <div className="flex flex-col md:flex-row w-full gap-3 p-2 bg-black/20 rounded-lg animate-in slide-in-from-bottom-2">
                        <Input placeholder="Style Name" className="flex-1 bg-black/40" value={newStyle.name} onChange={e => setNewStyle({...newStyle, name: e.target.value})} />
                        <Input type="number" placeholder="Price" className="w-32 bg-black/40" value={newStyle.price} onChange={e => setNewStyle({...newStyle, price: e.target.value})} />
                        <div className="flex gap-2">
                          <Button onClick={() => addStyle(category.id!)}>Add</Button>
                          <Button variant="ghost" onClick={() => setNewStyle(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <Button variant="ghost" className="w-full border-dashed border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 h-12 transition-all uppercase font-bold tracking-widest text-xs" onClick={() => setNewStyle({ catId: category.id!, name: '', price: '' })}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Style
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )
            )}
          </div>
        </TabsContent>

        <TabsContent value="access" className="animate-in fade-in duration-500">
          <Card className="border-primary/20 bg-card/40 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-primary/10 pb-6 mb-6">
              <div>
                <CardTitle className="uppercase tracking-widest text-primary flex items-center gap-2">
                  <UserCog className="h-6 w-6" />
                  Access Control
                </CardTitle>
                <CardDescription>Manage administrative privileges</CardDescription>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-destructive/20 text-destructive hover:bg-destructive/10">
                    <UserMinus className="mr-2 h-4 w-4" />
                    Reset Directory
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-primary/20">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-destructive font-bold uppercase">Reset User Directory?</AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                      This will remove permissions for all users except you ({ADMIN_EMAIL}). Users can then log in again to show up as "Pending."
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-secondary/50">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={resetAllOtherUsers} className="bg-destructive text-destructive-foreground">Reset All</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardHeader>
            <CardContent>
              {isAdminsLoading ? <div className="text-center p-8"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" /></div> : (
                <div className="grid gap-4">
                  {adminUsers?.map((admin: any) => (
                    <div key={admin.id} className={`flex items-center justify-between p-6 rounded-xl border transition-all ${admin.approved ? 'bg-primary/5 border-primary/20' : 'bg-secondary/20'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${admin.approved ? 'bg-primary/20 text-primary' : 'bg-yellow-500/10 text-yellow-500'}`}>
                          {admin.approved ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
                        </div>
                        <div>
                          <p className="font-bold">{admin.email}</p>
                          <Badge variant={admin.approved ? "default" : "outline"} className="text-[8px] uppercase">
                            {admin.approved ? 'AUTHORIZED' : 'PENDING'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {admin.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase() && (
                          <>
                            <Button 
                              variant={admin.approved ? "outline" : "default"} 
                              onClick={() => toggleUserApproval(admin.id, admin.approved, admin.email)}
                              disabled={isUpdatingUser === admin.id}
                              size="sm"
                              className="font-bold uppercase text-[10px]"
                            >
                              {isUpdatingUser === admin.id ? <Loader2 className="h-3 w-3 animate-spin" /> : (admin.approved ? 'Revoke' : 'Approve')}
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive">
                                  <Trash2 className="h-5 w-5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-card border-primary/20">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-destructive uppercase font-bold">Remove User?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Completely delete {admin.email} from the directory.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteUser(admin.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                        {admin.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() && (
                          <Badge className="bg-primary/20 text-primary border-primary/20 uppercase text-[10px]">Admin</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!adminUsers || adminUsers.length === 0) && (
                    <div className="text-center p-12 text-muted-foreground italic">
                      No other registered accounts found.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
