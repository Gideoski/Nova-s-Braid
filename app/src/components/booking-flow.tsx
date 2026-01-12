'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { serviceCategories, Service } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Plus, Trash2, User, Users, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { useFirestore, useCollection } from '@/firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';

type Step = 'CHOOSE_TYPE' | 'SELECT_SERVICES' | 'SELECT_DATETIME' | 'USER_INFO' | 'CONFIRM';

interface Attendee {
  id: string;
  isGuest: boolean;
  name: string;
  phone: string;
  services: Service[];
}

const bookingInfo = [
    "At least 5% payment of the total is mandatory before rendering services to this account: Account number- 9135368368, Bank- OPAY, Name- FAVOUR CHINOYE OKOHIE. PAYMENTS RECEIPTS SHOULD BE SENT IMMEDIATELY AFTER BOOKING!!!",
    "Prices don't include attachment/extension.",
    "Attachment should be brought in before time for prepping.",
    "Come on time for your appointment to avoid extra fees.",
    "Book appointment early.",
    "No Credit!!!",
];

const ADMIN_PHONE_CLEAN = '2349135368368';

// This function now generates a UUID only on the client-side.
const generateId = () => (typeof window !== 'undefined' ? self.crypto.randomUUID() : '');

export function BookingFlow() {
  const [step, setStep] = useState<Step>('CHOOSE_TYPE');
  const [isGroup, setIsGroup] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string>('09:00');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This now runs only on the client, preventing a hydration mismatch.
    setIsClient(true);
    // Initialize date only on client-side to prevent mismatch.
    if (date === null) {
      setDate(format(new Date(), 'yyyy-MM-dd'));
    }
  }, [date]);
  
  const bottomNavRef = useRef<HTMLDivElement>(null);

  const firestore = useFirestore();
  const appointmentsRef = useMemo(() => firestore ? collection(firestore, 'appointments') : null, [firestore]);
  const { data: appointments, loading: appointmentsLoading } = useCollection(appointmentsRef);

  const [availability, setAvailability] = useState<'checking' | 'available' | 'unavailable' | 'invalid'>('invalid');

  const selectedDateTime = useMemo(() => {
    if (!date || !time) return null;
    try {
      const dateTimeString = `${date}T${time}`;
      return new Date(dateTimeString);
    } catch {
      return null;
    }
  }, [date, time]);

  useEffect(() => {
    if (!selectedDateTime) {
      setAvailability('invalid');
      return;
    }

    if (appointmentsLoading) {
      setAvailability('checking');
      return;
    }

    if (!appointments) {
      setAvailability('available'); // Assume available if loading fails
      return;
    }

    const isBooked = appointments.some(app => {
      const bookedTime = (app.dateTime as Timestamp).toDate();
      // Compare only date and hour, as minutes might not be exact and cause issues.
      return bookedTime.getFullYear() === selectedDateTime.getFullYear() &&
             bookedTime.getMonth() === selectedDateTime.getMonth() &&
             bookedTime.getDate() === selectedDateTime.getDate() &&
             bookedTime.getHours() === selectedDateTime.getHours();
    });

    setAvailability(isBooked ? 'unavailable' : 'available');
  }, [selectedDateTime, appointments, appointmentsLoading]);

  const totalCost = useMemo(() => {
    return attendees.reduce((total, attendee) => {
      return total + attendee.services.reduce((subTotal, service) => subTotal + service.price, 0);
    }, 0);
  }, [attendees]);

  const handleNextStep = () => {
    switch (step) {
      case 'CHOOSE_TYPE':
        setAttendees([{ id: generateId(), isGuest: false, name: '', phone: '', services: [] }]);
        setStep('SELECT_SERVICES');
        break;
      case 'SELECT_SERVICES':
        if (attendees.some(a => a.services.length > 0)) {
            setStep('SELECT_DATETIME');
        }
        break;
      case 'SELECT_DATETIME':
        if (selectedDateTime && availability === 'available') {
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
      case 'SELECT_SERVICES': 
        setStep('CHOOSE_TYPE'); 
        setAttendees([]);
        break;
      case 'SELECT_DATETIME': setStep('SELECT_SERVICES'); break;
      case 'USER_INFO': setStep('SELECT_DATETIME'); break;
      case 'CONFIRM': setStep('USER_INFO'); break;
    }
  };
  
  const addGuest = () => {
    if(isGroup) {
      setAttendees([...attendees, { id: generateId(), isGuest: true, name: '', phone: '', services: [] }]);
    }
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
    setTimeout(() => {
      bottomNavRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  const updateAttendeeInfo = (id: string, field: 'name' | 'phone', value: string) => {
      setAttendees(attendees.map(a => a.id === id ? {...a, [field]: value} : a));
  }

  const handleBooking = async () => {
    if (!termsAccepted || !selectedDateTime || !firestore) return;

    try {
        await addDoc(collection(firestore, 'appointments'), {
            dateTime: Timestamp.fromDate(selectedDateTime),
            attendees: attendees.map(({id, isGuest, ...rest}) => rest),
            totalCost,
        });

        let message = `Hello NOVA'S BRAID GAME👋\nI'd like to book an appointment.\n\n`;
        message += `*Date:* ${format(selectedDateTime, 'PPP')}\n`;
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
    } catch (error) {
        console.error("Error adding document: ", error);
    }
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
                        <div className="flex items-center w-full p-4">
                            <AccordionTrigger className="text-lg font-semibold flex-1 p-0">
                                <span>{attendee.isGuest ? `Guest ${index + 1}` : "Your Services"}</span>
                            </AccordionTrigger>
                            {attendee.isGuest && (
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => removeGuest(attendee.id)}
                                    className="ml-2"
                                >
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                            )}
                        </div>
                        <AccordionContent className="p-4 pt-0">
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
        if (!isClient || date === null) {
          return (
            <div className="max-w-md mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Select Date & Time</CardTitle>
                  <CardDescription>Choose a date and time for your appointment.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="appointment-date">Date</Label>
                    <div className="h-10 w-full rounded-md border border-input bg-background flex items-center px-3 py-2">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        }
        return (
            <div className="max-w-md mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Select Date & Time</CardTitle>
                  <CardDescription>Choose a date and time for your appointment.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="appointment-date">Date</Label>
                    <Input
                      id="appointment-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full text-lg p-2"
                      min={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor="appointment-time" className="flex items-center gap-2">
                        <Clock className="h-5 w-5"/>
                        Appointment Time
                    </Label>
                    <Input
                      id="appointment-time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full text-lg p-2"
                    />
                  </div>
                   <div className="text-center p-2 rounded-md">
                        {availability === 'checking' && <p className="text-sm text-muted-foreground flex items-center justify-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Checking availability...</p>}
                        {availability === 'available' && <p className="text-sm font-semibold text-green-600">This slot is available.</p>}
                        {availability === 'unavailable' && <p className="text-sm font-semibold text-red-600">This slot is unavailable. Please pick another date or time.</p>}
                        {availability === 'invalid' && <p className="text-sm text-amber-600">Please enter a valid date and time.</p>}
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
                            <CardTitle>{attendee.isGuest ? `Guest ${index + 1} Information` : 'Your Information'}</CardTitle>
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
                        <div className="flex justify-between"><span className="font-semibold">Date:</span> <span>{selectedDateTime ? format(selectedDateTime, 'PPP') : 'Invalid Date'}</span></div>
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
            <div ref={bottomNavRef} className="flex justify-center gap-4 mt-8">
                <Button variant="outline" onClick={handlePrevStep}><ChevronLeft className="mr-2 h-4 w-4" /> Back</Button>
                <Button onClick={handleNextStep} disabled={ 
                    (step === 'CONFIRM' && !termsAccepted) || 
                    (step === 'SELECT_SERVICES' && attendees.every(a => a.services.length === 0)) || 
                    (step === 'SELECT_DATETIME' && (availability !== 'available' || !selectedDateTime))
                }>
                   {step === 'CONFIRM' ? 'Book Appointment' : 'Continue'} <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        )}
    </div>
  );
}
