'use client';

import { useState, useMemo } from 'react';
import { serviceCategories, Service, ServiceCategory } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash2, User, Users } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';

type Step = 'CHOOSE_TYPE' | 'SELECT_SERVICES' | 'SELECT_DATETIME' | 'USER_INFO' | 'CONFIRM';

interface Attendee {
  id: string;
  isGuest: boolean;
  name: string;
  phone: string;
  services: Service[];
}

const bookingInfo = [
    "Prices don't include attachment/extension.",
    "Attachment should be brought in before time for prepping.",
    "Come on time for your appointment to avoid extra fees.",
    "Book appointment early.",
    "No Credit!!!",
];

const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
];

const ADMIN_PHONE_CLEAN = '2349135368368';

export function BookingFlow() {
  const [step, setStep] = useState<Step>('CHOOSE_TYPE');
  const [isGroup, setIsGroup] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const totalCost = useMemo(() => {
    return attendees.reduce((total, attendee) => {
      return total + attendee.services.reduce((subTotal, service) => subTotal + service.price, 0);
    }, 0);
  }, [attendees]);

  const handleNextStep = () => {
    switch (step) {
      case 'CHOOSE_TYPE':
        setAttendees([{ id: crypto.randomUUID(), isGuest: false, name: '', phone: '', services: [] }]);
        setStep('SELECT_SERVICES');
        break;
      case 'SELECT_SERVICES':
        if (attendees.some(a => a.services.length > 0)) {
            setStep('SELECT_DATETIME');
        }
        break;
      case 'SELECT_DATETIME':
        if (date && time) {
            setStep('USER_INFO');
        }
        break;
      case 'USER_INFO':
        if (attendees.every(a => a.name && a.phone)) {
            setStep('CONFIRM');
        }
        break;
      case 'CONFIRM':
        handleBooking();
        break;
    }
  };

  const handlePrevStep = () => {
    switch (step) {
      case 'SELECT_SERVICES': setStep('CHOOSE_TYPE'); break;
      case 'SELECT_DATETIME': setStep('SELECT_SERVICES'); break;
      case 'USER_INFO': setStep('SELECT_DATETIME'); break;
      case 'CONFIRM': setStep('USER_INFO'); break;
    }
  };
  
  const addGuest = () => {
    setAttendees([...attendees, { id: crypto.randomUUID(), isGuest: true, name: '', phone: '', services: [] }]);
  };

  const removeGuest = (id: string) => {
    setAttendees(attendees.filter(a => a.id !== id));
  };

  const toggleService = (attendeeId: string, service: Service) => {
    setAttendees(attendees.map(a => {
      if (a.id === attendeeId) {
        const hasService = a.services.find(s => s.name === service.name);
        if (hasService) {
          return { ...a, services: a.services.filter(s => s.name !== service.name) };
        } else {
          return { ...a, services: [...a.services, service] };
        }
      }
      return a;
    }));
  };
  
  const updateAttendeeInfo = (id: string, field: 'name' | 'phone', value: string) => {
      setAttendees(attendees.map(a => a.id === id ? {...a, [field]: value} : a));
  }

  const handleBooking = () => {
    if (!termsAccepted) return;

    let message = `Hello NOVA'S BRAID GAME👋\nI'd like to book an appointment.\n\n`;
    message += `*Date:* ${format(date!, 'PPP')}\n`;
    message += `*Time:* ${time}\n\n`;

    attendees.forEach((attendee, index) => {
        message += `*${attendee.isGuest ? `Guest ${index}` : 'Appointment For'}:*\n`;
        message += `Name: ${attendee.name}\n`;
        message += `Phone: ${attendee.phone}\n`;
        message += `Services: ${attendee.services.map(s => s.name).join(', ')}\n\n`;
    });
    
    message += `*Total: ₦${totalCost.toLocaleString()}*\n`;
    
    const whatsappUrl = `https://wa.me/${ADMIN_PHONE_CLEAN}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const renderStep = () => {
    switch (step) {
      case 'CHOOSE_TYPE':
        return (
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => { setIsGroup(false); handleNextStep(); }}>
                    <CardHeader className="items-center text-center">
                        <User className="h-12 w-12 mb-4 text-primary" />
                        <CardTitle>Book an Appointment</CardTitle>
                        <CardDescription>Schedule services for yourself</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => { setIsGroup(true); handleNextStep(); }}>
                    <CardHeader className="items-center text-center">
                        <Users className="h-12 w-12 mb-4 text-primary" />
                        <CardTitle>Group Appointment</CardTitle>
                        <CardDescription>For yourself and others</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );

      case 'SELECT_SERVICES':
        return (
          <div className="max-w-4xl mx-auto">
            <Accordion type="multiple" defaultValue={attendees.map(a => a.id)} className="w-full space-y-4">
                {attendees.map((attendee, index) => (
                    <AccordionItem value={attendee.id} key={attendee.id} className="border rounded-lg">
                        <AccordionTrigger className="p-4 text-lg font-semibold">
                            <div className="flex items-center justify-between w-full">
                                <span>{attendee.isGuest ? `Guest ${index}` : "Your Services"}</span>
                                {attendee.isGuest && <Button variant="ghost" size="icon" onClick={() => removeGuest(attendee.id)}><Trash2 className="h-4 w-4"/></Button>}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4">
                           <div className="space-y-4">
                            {serviceCategories.map(category => (
                                <div key={category.id}>
                                    <h3 className="font-bold mb-2">{category.name}</h3>
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {category.services.map(service => (
                                        <Card key={service.name} className={`cursor-pointer transition-all ${attendee.services.find(s => s.name === service.name) ? 'border-primary ring-2 ring-primary' : ''}`} onClick={() => toggleService(attendee.id, service)}>
                                            <CardHeader>
                                                <CardTitle className="text-base">{service.name}</CardTitle>
                                                <CardDescription className="text-lg font-bold text-primary">₦{service.price.toLocaleString()}</CardDescription>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                    </div>
                                </div>
                            ))}
                           </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            {isGroup && <Button onClick={addGuest} className="mt-4"><Plus className="mr-2 h-4 w-4"/>Add Guest</Button>}
          </div>
        );

      case 'SELECT_DATETIME':
        return (
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Select Date & Time</CardTitle>
                  <CardDescription>Choose an available date and time for your appointment.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                  <div className="flex justify-center">
                    <Calendar 
                      mode="single" 
                      selected={date} 
                      onSelect={setDate} 
                      disabled={(d) => d < new Date(new Date().toDateString())}
                      className="rounded-md border"
                    />
                  </div>
                  <div className="space-y-4">
                      <h3 className="font-semibold text-center md:text-left">
                          Available Slots for {date ? format(date, 'PPP') : '...'}
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                          {timeSlots.map(slot => (
                              <Button 
                                  key={slot} 
                                  variant={time === slot ? 'default' : 'outline'}
                                  onClick={() => setTime(slot)}
                                  className={cn("w-full", time === slot && "ring-2 ring-primary")}
                              >
                                  {slot}
                              </Button>
                          ))}
                      </div>
                  </div>
                </CardContent>
              </Card>
            </div>
        );
        
      case 'USER_INFO':
        return (
            <div className="max-w-xl mx-auto space-y-6">
                {attendees.map((attendee, index) => (
                    <Card key={attendee.id}>
                        <CardHeader>
                            <CardTitle>{attendee.isGuest ? `Guest ${index} Information` : 'Your Information'}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor={`name-${attendee.id}`}>Name</Label>
                                <Input id={`name-${attendee.id}`} value={attendee.name} onChange={e => updateAttendeeInfo(attendee.id, 'name', e.target.value)} placeholder="Full Name" />
                            </div>
                            <div>
                                <Label htmlFor={`phone-${attendee.id}`}>Phone Number</Label>
                                <Input id={`phone-${attendee.id}`} value={attendee.phone} onChange={e => updateAttendeeInfo(attendee.id, 'phone', e.target.value)} placeholder="Phone Number" type="tel"/>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );

      case 'CONFIRM':
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <Card>
                    <CardHeader><CardTitle>Confirm Your Appointment</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between"><span className="font-semibold">Date:</span> <span>{date ? format(date, 'PPP') : ''}</span></div>
                        <div className="flex justify-between"><span className="font-semibold">Time:</span> <span>{time}</span></div>
                        <Separator />
                        {attendees.map((attendee) => (
                            <div key={attendee.id} className="space-y-2">
                                <h4 className="font-semibold">{attendee.isGuest ? `Guest: ${attendee.name}` : attendee.name}</h4>
                                <p className="text-sm text-muted-foreground">{attendee.phone}</p>
                                <ul className="list-disc list-inside text-sm">
                                    {attendee.services.map(s => <li key={s.name}>{s.name} - ₦{s.price.toLocaleString()}</li>)}
                                </ul>
                            </div>
                        ))}
                        <Separator />
                        <div className="flex justify-between text-lg font-bold"><span >Total:</span> <span>₦{totalCost.toLocaleString()}</span></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Booking Info</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                            {bookingInfo.map((info, i) => <li key={i}>{info}</li>)}
                        </ul>
                        <div className="flex items-center space-x-2 mt-4">
                            <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(Boolean(checked))} />
                            <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                I agree to the booking information
                            </label>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );

      default: return null;
    }
  };
  
  return (
    <div>
        {renderStep()}
        {step !== 'CHOOSE_TYPE' && (
            <div className="flex justify-center gap-4 mt-8">
                <Button variant="outline" onClick={handlePrevStep}><ChevronLeft className="mr-2 h-4 w-4" /> Back</Button>
                <Button onClick={handleNextStep} disabled={ (step === 'CONFIRM' && !termsAccepted) || (step === 'SELECT_SERVICES' && attendees.every(a => a.services.length === 0)) || (step === 'SELECT_DATETIME' && (!date || !time))}>
                   {step === 'CONFIRM' ? 'Book Appointment' : 'Continue'} <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        )}
    </div>
  );
}
