'use client';

import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Moon, Sun, LogOut } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
      router.push('/login');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Sign Out Failed',
        description: 'There was an error signing out. Please try again.',
      });
    }
  };


  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-12 text-center text-primary">Settings</h1>
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={theme} onValueChange={(value) => setTheme(value || 'dark')}>
                <div className="grid gap-4">
                  <Label
                    htmlFor="light"
                    className="flex items-center gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent"
                  >
                    <RadioGroupItem value="light" id="light" />
                    <div className="flex items-center gap-2">
                      <Sun className="h-5 w-5" />
                      <span>Light</span>
                    </div>
                  </Label>
                  <Label
                    htmlFor="dark"
                    className="flex items-center gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent"
                  >
                    <RadioGroupItem value="dark" id="dark" />
                    <div className="flex items-center gap-2">
                      <Moon className="h-5 w-5" />
                      <span>Dark</span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {user && (
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>
                  Manage your account settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
