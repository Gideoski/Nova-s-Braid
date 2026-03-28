'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDocs, collection, query, limit } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, LogIn, UserPlus, Eye, EyeOff, ArrowLeft, ShieldAlert, CheckCircle2, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import Link from 'next/link';

const SUPER_ADMIN_EMAIL = 'gideonjackbara@gmail.com';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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

  // Handle Redirection & Auto-Approval for Super Admin
  useEffect(() => {
    if (!isUserLoading && !isUserDataLoading && user) {
      const isSuperAdmin = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
      
      if (userData) {
        if (userData.approved) {
          router.push('/admin');
        } else if (isSuperAdmin) {
          // If super admin is logged in but doc says not approved, fix it immediately
          const userRef = doc(firestore!, 'users', user.uid);
          updateDocumentNonBlocking(userRef, { approved: true });
        }
      } else if (isSuperAdmin) {
        // If super admin exists in Auth but not in Firestore, create the doc
        const userRef = doc(firestore!, 'users', user.uid);
        setDocumentNonBlocking(userRef, {
          email: user.email,
          approved: true,
          createdAt: new Date().toISOString()
        }, { merge: true });
      }
    }
  }, [user, userData, isUserLoading, isUserDataLoading, router, firestore]);

  const getProfessionalErrorMessage = (error: any) => {
    const code = error?.code || '';
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email address is already registered. Please login instead.';
      case 'auth/invalid-email':
        return 'Invalid email format. Please verify and try again.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid credentials. Access denied.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Access temporarily restricted.';
      case 'auth/network-request-failed':
      case 'unavailable':
        return 'Server connection lost. Please check your internet or retry.';
      default:
        return 'An internal error occurred. Please try again.';
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    signInWithEmailAndPassword(auth, email, password)
      .catch((error: any) => {
        setIsLoading(false);
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: getProfessionalErrorMessage(error),
        });
      });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      let shouldBeApproved = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
      
      if (!shouldBeApproved) {
        try {
          const usersSnap = await getDocs(query(collection(firestore!, 'users'), limit(1)));
          shouldBeApproved = usersSnap.empty;
        } catch (checkError) {
          console.warn("Priority check timed out.", checkError);
        }
      }

      const userRef = doc(firestore!, 'users', newUser.uid);
      setDocumentNonBlocking(userRef, {
        email: email,
        approved: shouldBeApproved,
        createdAt: new Date().toISOString()
      }, { merge: true });

      toast({
        title: shouldBeApproved ? "Master Access Granted" : "Registration Sent",
        description: shouldBeApproved 
          ? "Welcome, Master Operator. Entering system..." 
          : "Your access request is pending administrator approval.",
      });
      
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        signInWithEmailAndPassword(auth, email, password).catch((signInError: any) => {
           setIsLoading(false);
           toast({
            variant: 'destructive',
            title: 'Authentication Failed',
            description: getProfessionalErrorMessage(signInError),
          });
        });
        return;
      }

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
            <CardTitle className="text-2xl font-bold text-destructive uppercase">Network Timeout</CardTitle>
            <CardDescription className="mt-4">
              Unable to reach the security server. This is common in restricted network environments.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" onClick={() => window.location.reload()}>
              Retry Connection
            </Button>
            <Button variant="link" className="text-muted-foreground text-xs" onClick={() => auth.signOut()}>
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isUserLoading || (user && isUserDataLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm uppercase tracking-widest animate-pulse">Checking Permissions...</p>
      </div>
    );
  }

  if (user && (!userData || !userData.approved)) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full border-primary/20 bg-card/40 backdrop-blur-xl animate-in fade-in zoom-in duration-500">
          <CardHeader className="text-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="h-10 w-10 text-primary animate-pulse" />
            </div>
            <CardTitle className="text-3xl font-bold text-primary uppercase tracking-tighter">Access Pending</CardTitle>
            <CardDescription className="text-muted-foreground mt-4 text-balance">
              Your account <strong>{user.email}</strong> is registered. Administrative access must be approved by a Super Admin.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-4">
            <Button variant="outline" className="w-full border-primary/20" onClick={() => auth.signOut()}>
              Sign Out
            </Button>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-center">
              Protocol: Secure Access Request Active
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
              Nova Admin
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
                    <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-black/40 border-primary/10"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-black/40 border-primary/10 pr-10"/>
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
                    <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-black/40 border-primary/10"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input id="signup-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-black/40 border-primary/10 pr-10"/>
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
            Unauthorized access attempts are monitored.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
