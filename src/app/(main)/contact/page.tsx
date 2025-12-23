'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageCircle, Phone } from 'lucide-react';

const ADMIN_PHONE = '+2349135368368';
const ADMIN_PHONE_CLEAN = '2349135368368';
const ADMIN_EMAIL = 'fokehie25@gmail.com';

export default function ContactPage() {
  const [feedback, setFeedback] = useState('');

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `*Feedback for NOVA'S BRAID GAME:*\n\n${feedback}`;
    const whatsappUrl = `https://wa.me/${ADMIN_PHONE_CLEAN}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Get In Touch</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Reach out to us for inquiries.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <a href={`tel:${ADMIN_PHONE}`} className="flex items-center gap-4 group">
                  <Phone className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-lg group-hover:underline">{ADMIN_PHONE}</span>
                </a>
                <a href={`mailto:${ADMIN_EMAIL}`} className="flex items-center gap-4 group">
                  <Mail className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-lg group-hover:underline">{ADMIN_EMAIL}</span>
                </a>
                <a href={`https://wa.me/${ADMIN_PHONE_CLEAN}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <MessageCircle className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-lg group-hover:underline">Chat on WhatsApp</span>
                </a>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Send Feedback</CardTitle>
                <CardDescription>Let us know what you think.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="feedback" className="sr-only">Your Feedback</Label>
                    <Textarea
                      id="feedback"
                      placeholder="Your feedback..."
                      rows={6}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Send via WhatsApp
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
