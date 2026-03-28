
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, LogIn, UserPlus, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/admin');
    }
  }, [user, isUserLoading, router]);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Using non-blocking pattern with .then/.catch for professional feedback
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        // Redirect happens automatically via useEffect on useUser update
        toast({
          title: "Access Granted",
          description: "Welcome back, Nova. Entering dashboard...",
        });
      })
      .catch((error: any) => {
        setIsLoading(false);
        toast({
          variant: 'destructive',
          title: 'Sign In Failed',
          description: error.message || 'Check your credentials and try again.',
        });
      });
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Using non-blocking pattern with .then/.catch
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        toast({
          title: "Account Created",
          description: "Admin access has been granted.",
        });
      })
      .catch((error: any) => {
        setIsLoading(false);
        toast({
          variant: 'destructive',
          title: 'Registration Failed',
          description: error.message || 'Could not create admin account.',
        });
      });
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in duration-500">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Return to Braid Game
        </Link>
        
        <Card className="border-primary/20 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden">
          <CardHeader className="space-y-2 text-center pb-8 border-b border-primary/10 mb-6">
            <CardTitle className="text-4xl font-bold tracking-tighter text-primary uppercase sparkle-text">
              Nova Admin
            </CardTitle>
            <CardDescription className="text-muted-foreground font-light text-base">
              Secure access for the Braid Game Master.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-black/40 border border-primary/10">
                <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Register
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-muted-foreground">Admin Email</Label>
                    <Input 
                      id="login-email" 
                      type="email" 
                      placeholder="admin@example.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      className="bg-black/20 border-primary/10 focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input 
                        id="login-password" 
                        type={showPassword ? 'text' : 'password'} 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        className="pr-10 bg-black/20 border-primary/10 focus:border-primary/50 transition-colors"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 mt-4 font-bold uppercase tracking-[0.2em] shadow-lg shadow-primary/20" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                    Enter Dashboard
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">New Admin Email</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="admin@example.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      className="bg-black/20 border-primary/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Secure Password</Label>
                    <div className="relative">
                      <Input 
                        id="signup-password" 
                        type={showPassword ? 'text' : 'password'} 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        className="pr-10 bg-black/20 border-primary/10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 mt-4 font-bold uppercase tracking-[0.2em]" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                    Create Admin
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 py-6 bg-black/20">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold">
              <div className="h-px w-8 bg-primary/20" />
              Restricted Area
              <div className="h-px w-8 bg-primary/20" />
            </div>
            <p className="text-[10px] text-muted-foreground text-center px-4 leading-relaxed">
              Unauthorized access attempts are logged and reported.
              Please ensure your connection is secure.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
