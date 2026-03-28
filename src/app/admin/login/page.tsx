'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, LogIn, UserPlus, Eye, EyeOff, ArrowLeft, ShieldAlert, WifiOff, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const ADMIN_EMAIL = 'gideonjackbara@gmail.com';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData, isLoading: isUserDataLoading, error: userDocError } = useDoc(userDocRef);

  const isMainAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // Redirection & Auto-registration Logic
  useEffect(() => {
    if (!isUserLoading && user && !isUserDataLoading) {
      const isUserMainAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      
      // If we are sure the user record is missing, create it.
      // We use a direct check to ensure we don't overwrite existing approval status.
      if (!userData && !userDocError && firestore) {
        const checkAndCreate = async () => {
          const userRef = doc(firestore, 'users', user.uid);
          const snap = await getDoc(userRef);
          
          if (!snap.exists()) {
            await setDoc(userRef, {
              email: user.email,
              approved: isUserMainAdmin, 
              createdAt: new Date().toISOString()
            }, { merge: true });
          }
        };
        checkAndCreate();
      }

      // Check for authorized state
      if (isUserMainAdmin || (userData?.approved === true)) {
        setIsAuthorizing(true);
        router.replace('/admin');
      }
    }
  }, [user, userData, isUserLoading, isUserDataLoading, userDocError, router, firestore]);

  const getProfessionalErrorMessage = (error: any) => {
    const code = error?.code || '';
    if (error?.message?.includes('unavailable') || error?.message?.includes('timeout') || code === 'auth/network-request-failed') {
      return 'Network connection delay. Please try again.';
    }
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Email already registered. Please Login instead of Registering.';
      case 'auth/invalid-email':
        return 'Invalid email format.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid credentials. Access denied.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setIsLoading(false);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: getProfessionalErrorMessage(error),
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      const isUserMainAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      
      const userRef = doc(firestore!, 'users', newUser.uid);
      await setDoc(userRef, {
        email: email,
        approved: isUserMainAdmin, 
        createdAt: new Date().toISOString()
      }, { merge: true });

      toast({
        title: isUserMainAdmin ? "Admin Access Granted" : "Registration Sent",
        description: isUserMainAdmin 
          ? "Welcome back, Admin." 
          : "Access request is pending approval.",
      });
      
    } catch (error: any) {
      setIsLoading(false);
      toast({
        variant: 'destructive',
        title: 'Registration Error',
        description: getProfessionalErrorMessage(error),
      });
    }
  };

  if (userDocError && (userDocError.message?.includes('unavailable') || userDocError.message?.includes('timeout'))) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive/20 bg-card/40 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <WifiOff className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold text-destructive uppercase tracking-tighter">Network Delay</CardTitle>
            <CardDescription className="mt-4">
              The security server is taking too long to respond. This is common in some network environments.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" onClick={() => window.location.reload()}>
              Retry Connection
            </Button>
            <Button variant="link" className="text-muted-foreground text-xs" onClick={() => auth.signOut()}>
              Switch Account
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const isPending = !isUserLoading && !isUserDataLoading && user && !isMainAdmin && (!userData || userData.approved === false);

  if (isUserLoading || (user && isUserDataLoading && !isMainAdmin) || isAuthorizing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm uppercase tracking-widest animate-pulse">
          {isAuthorizing ? 'Access Granted. Redirecting...' : 'Verifying Access...'}
        </p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full border-primary/20 bg-card/40 backdrop-blur-xl animate-in fade-in zoom-in duration-500">
          <CardHeader className="text-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="h-10 w-10 text-primary animate-pulse" />
            </div>
            <CardTitle className="text-3xl font-bold text-primary uppercase tracking-tighter">Access Pending</CardTitle>
            <CardDescription className="text-muted-foreground mt-4">
              Account <strong>{user.email}</strong> is registered. Access must be authorized by the Admin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg text-xs text-center text-muted-foreground italic">
              The dashboard will refresh automatically once approved.
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button variant="outline" className="w-full border-primary/20 group" onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
              Check Authorization
            </Button>
            <Button variant="ghost" className="w-full text-muted-foreground text-xs uppercase tracking-widest hover:text-primary" onClick={() => { setIsLoading(false); auth.signOut(); }}>
              Log Out
            </Button>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-center mt-2">
              Protocol: Secure Access Active
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
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
              Admin Login
            </CardTitle>
            <CardDescription className="text-muted-foreground font-light text-base">
              Authorized personnel only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-black/40 border border-primary/10 p-1 h-12">
                <TabsTrigger 
                  value="login"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold transition-all"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold transition-all"
                >
                  Register
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-5">
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-black/40 border-primary/10 focus:ring-primary/50"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-black/40 border-primary/10 pr-10 focus:ring-primary/50"/>
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4 text-primary" /> : <Eye className="h-4 w-4 text-primary" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 mt-4 font-bold uppercase shadow-lg shadow-primary/20" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                    Login
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-5">
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-black/40 border-primary/10 focus:ring-primary/50"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input id="signup-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-black/40 border-primary/10 pr-10 focus:ring-primary/50"/>
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4 text-primary" /> : <Eye className="h-4 w-4 text-primary" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 mt-4 font-bold uppercase shadow-lg shadow-primary/20" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                    Register
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="py-6 bg-black/20 text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold justify-center">
            Monitoring active security protocols.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
