'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDocs, query, limit } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, LogIn, UserPlus, Eye, EyeOff, ArrowLeft, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import Link from 'next/link';

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

  const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);

  // Handle Redirection
  useEffect(() => {
    if (!isUserLoading && !isUserDataLoading && user && userData) {
      if (userData.approved) {
        router.push('/admin');
      }
    }
  }, [user, userData, isUserLoading, isUserDataLoading, router]);

  const getProfessionalErrorMessage = (error: any) => {
    const code = error?.code || '';
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email address is already registered in our administrative records.';
      case 'auth/invalid-email':
        return 'The email format provided is not recognized. Please verify and try again.';
      case 'auth/weak-password':
        return 'The provided password does not meet the minimum security requirements.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'The credentials provided are incorrect. Access denied.';
      case 'auth/too-many-requests':
        return 'Multiple failed attempts detected. Access has been temporarily restricted for security.';
      default:
        return 'An internal authentication error occurred. Please try again later.';
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        // Redirection will be handled by useEffect once userData is loaded
      })
      .catch((error: any) => {
        setIsLoading(false);
        toast({
          variant: 'destructive',
          title: 'Authentication Failed',
          description: getProfessionalErrorMessage(error),
        });
      });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Check if any users exist. If not, the first user is the super admin.
      const usersSnap = await getDocs(query(collection(firestore!, 'users'), limit(1)));
      const isFirstUser = usersSnap.empty;

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Create the user document in Firestore
      const userRef = doc(firestore!, 'users', newUser.uid);
      setDocumentNonBlocking(userRef, {
        email: email,
        approved: isFirstUser, // Auto-approve only if first user
        createdAt: new Date().toISOString()
      }, { merge: true });

      toast({
        title: isFirstUser ? "Master Account Created" : "Access Requested",
        description: isFirstUser 
          ? "You have been granted Master Access. Entering dashboard..." 
          : "Your request is pending. Please contact the administrator for approval.",
      });
      
    } catch (error: any) {
      setIsLoading(false);
      
      // If email already exists, it means they are trying to register again
      if (error.code === 'auth/email-already-in-use') {
        // Sign them in so the app can check their "approved" status
        signInWithEmailAndPassword(auth, email, password).catch(() => {
           toast({
            variant: 'destructive',
            title: 'Account Exists',
            description: getProfessionalErrorMessage(error),
          });
        });
        return;
      }

      toast({
        variant: 'destructive',
        title: 'Provisioning Failed',
        description: getProfessionalErrorMessage(error),
      });
    }
  };

  if (isUserLoading || (user && isUserDataLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // If user is logged in but not approved (or doc doesn't exist yet)
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
              Your account <strong>{user.email}</strong> is registered. However, administrative access must be manually approved by the master administrator.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <p className="text-sm text-muted-foreground">Registration confirmed. Your data is secure.</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button variant="outline" className="w-full border-primary/20" onClick={() => auth.signOut()}>
              Sign Out & Return
            </Button>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-center">
              Awaiting verification by Control Center
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
              Secure authentication for authorized personnel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-black/40 border border-primary/10 p-1">
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
                    <Label htmlFor="login-email">Admin Email</Label>
                    <Input 
                      id="login-email" 
                      type="email" 
                      placeholder="admin@example.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      className="bg-black/40 border-primary/10"
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
                        className="bg-black/40 border-primary/10 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-primary" /> : <Eye className="h-4 w-4 text-primary" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 mt-4 font-bold uppercase shadow-lg shadow-primary/20" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                    Enter Dashboard
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-5">
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Registration Email</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="admin@example.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      className="bg-black/40 border-primary/10"
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
                        className="bg-black/40 border-primary/10 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-primary" /> : <Eye className="h-4 w-4 text-primary" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 mt-4 font-bold uppercase shadow-lg shadow-primary/20" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                    Request Access
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 py-6 bg-black/20 text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold">
            <p>Unauthorized access attempts are monitored.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
