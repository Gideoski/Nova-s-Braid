
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDocs, query, limit } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, LogIn, UserPlus, Eye, EyeOff, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
      case 'auth/network-request-failed':
        return 'Connectivity issue detected. Please check your secure connection.';
      default:
        return 'An internal authentication error occurred. Please try again later.';
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        toast({
          title: "Session Initiated",
          description: "Verifying administrative permissions...",
        });
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
        approved: isFirstUser, // Auto-approve if first user
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

  // If user is logged in but not approved
  if (user && userData && !userData.approved) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full border-primary/20 bg-card/40 backdrop-blur-xl">
          <CardHeader className="text-center">
            <ShieldAlert className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-primary uppercase">Access Pending</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Your account ({user.email}) has been created successfully, but an administrator needs to approve your access before you can enter the dashboard.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => auth.signOut()}>
              Sign Out & Return
            </Button>
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
              
              <TabsContent value="login">
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
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 mt-4 font-bold uppercase" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                    Enter Dashboard
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
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
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 mt-4 font-bold uppercase" disabled={isLoading}>
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
