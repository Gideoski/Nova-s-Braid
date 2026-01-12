'use client';

import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Moon, Sun } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-12 text-center">Settings</h1>
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the look and feel of the application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={theme} onValueChange={(value) => setTheme(value)}>
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
      </div>
    </div>
  );
}
