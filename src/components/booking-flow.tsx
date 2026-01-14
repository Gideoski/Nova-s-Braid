
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { serviceCategories } from '@/lib/data';
import { BookedAppointment, Service } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Plus, Trash2, User, Users, Clock, Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { format, getDay, parseISO, isEqual } from 'date-fns';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useCollection, useFirestore, addDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

type Step = 'CHOOSE_TYPE' | 'SELECT_SERVICES' | 'SELECT_DATETIME' | 'USER_INFO' | 'CONFIRM';

interface SelectedService extends Service {
    quantity: number;
}

interface Attendee {
  id: string;
  isGuest: boolean;
  name: string;
  phone: string;
  services: SelectedService[];
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

const generateId = () => {
    if (typeof window !== 'undefined' && self.crypto?.randomUUID) {
        return self.crypto.randomUUID();
    }
    return `id-${Math.random().toString(36).substring(2, 9)}`;
};

export function BookingFlow() {
  const [step, setStep] = useState<Step>('CHOOSE_TYPE');
  const [isGroup, setIsGroup] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('09:00');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const firestore = useFirestore();

  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'appointments');
  }, [firestore]);

  const { data: existingAppointments, isLoading: isLoadingAppointments, error: appointmentsError } = useCollection<BookedAppointment>(appointmentsQuery);

  useEffect(() => {
    setIsClient(true);
    const today = new Date();
    setDate(format(today, 'yyyy-MM-dd'));
  }, []);

  const selectedDay = useMemo(() => {
    if (!date) return -1;
    try {
        const d = parseISO(date); 
        return getDay(d);
    } catch {
        return -1;
    }
  }, [date]);

  const isWeekday = selectedDay >= 1 && selectedDay <= 5;
  const weekdayTimes = ['09:00', '15:00'];

  useEffect(() => {
    if (isWeekday && !weekdayTimes.includes(time)) {
        setTime('09:00');
    }
  }, [isWeekday, time]);
  
  const bottomNavRef = useRef<HTMLDivElement>(null);

  const selectedDateTime = useMemo(() => {
    if (!date || !time) return null;
    try {
      const [year, month, day] = date.split('-').map(Number);
      const [hour, minute] = time.split(':').map(Number);
      return new Date(year, month - 1, day, hour, minute);
    } catch {
      return null;
    }
  }, [date, time]);

  const isSlotAvailable = useMemo(() => {
    if (!selectedDateTime || !existingAppointments) return true; // Assume available until data loads
    const selectedTimeISO = selectedDateTime.toISOString();
    return !existingAppointments.some(app => isEqual(parseISO(app.dateTime), selectedDateTime));
  }, [selectedDateTime, existingAppointments]);


  const totalCost = useMemo(() => {
    return attendees.reduce((total, attendee) => {
      return total + attendee.services.reduce((subTotal, s) => subTotal + s.price * s.quantity, 0);
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
        if (selectedDateTime && isSlotAvailable) {
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
          return { ...a, services: [...a.services, { ...service, quantity: 1 }] };
        }
      }
      return a;
    }));
    setTimeout(() => {
      bottomNavRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  const updateServiceQuantity = (attendeeId: string, serviceName: string, quantity: number) => {
    setAttendees(attendees.map(a => {
      if (a.id === attendeeId) {
        return {
          ...a,
          services: a.services.map(s => s.name === serviceName ? { ...s, quantity } : s)
        };
      }
      return a;
    }));
  };

  const updateAttendeeInfo = (id: string, field: 'name' | 'phone', value: string) => {
      setAttendees(attendees.map(a => a.id === id ? {...a, [field]: value} : a));
  }

  const handleBooking = async () => {
    if (!termsAccepted || !selectedDateTime || isSubmitting || !firestore || !appointmentsQuery) return;

    setIsSubmitting(true);
    
    const newAppointment: BookedAppointment = {
        dateTime: selectedDateTime.toISOString(),
        totalCost: totalCost,
        attendees: attendees.map(a => ({
            name: a.name,
            phone: a.phone,
            services: a.services.map(s => ({ name: s.name, quantity: s.quantity, price: s.price }))
        }))
    };

    addDocumentNonBlocking(appointmentsQuery, newAppointment);

    let message = `Hello NOVA'S BRAID GAME👋\nI'd like to book an appointment.\n\n`;
    message += `*Date:* ${format(selectedDateTime, 'PPP')}\n`;
    message += `*Time:* ${format(selectedDateTime, 'p')}\n\n`;

    attendees.forEach((attendee, index) => {
        message += `*${attendee.isGuest ? `Guest ${index + 1}` : 'Appointment For'}:*\n`;
        message += `Name: ${attendee.name}\n`;
        message += `Phone: ${attendee.phone}\n`;
        message += `Services:\n${attendee.services.map(s => `  - ${s.name}${s.quantity > 1 ? ` (x${s.quantity})` : ''}`).join('\n')}\n\n`;
    });
    
    message += `*Total: ₦${totalCost.toLocaleString()}*\n`;
    
    const whatsappUrl = `https://wa.me/${ADMIN_PHONE_CLEAN}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    
    setIsSubmitting(false);
  };

  const renderAvailability = () => {
    if (isLoadingAppointments) {
      return (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground p-2 rounded-md bg-accent">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Checking availability...</span>
        </div>
      );
    }
    if (appointmentsError) {
      return (
        <div className="flex items-center justify-center gap-2 text-sm text-destructive-foreground p-2 rounded-md bg-destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>Could not check availability. Pls try again.</span>
        </div>
      );
    }
    if (selectedDateTime) {
      if (isSlotAvailable) {
        return (
          <div className="flex items-center justify-center gap-2 text-sm text-green-600 p-2 rounded-md bg-green-100 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>Slot is available!</span>
          </div>
        );
      } else {
        return (
          <div className="flex items-center justify-center gap-2 text-sm text-red-600 p-2 rounded-md bg-red-100 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="h-4 w-4" />
            <span>Slot is unavailable. Please choose another time.</span>
          </div>
        );
      }
    }
    return <div className="text-center p-2 rounded-md"><p className="text-sm text-muted-foreground">Select a date and time to check availability.</p></div>;
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
                                    {category.services.map(service => {
                                        const isSelected = !!attendee.services.find(s => s.name === service.name);
                                        const isExtension = category.id === 'extensions';

                                        return (
                                            <Card key={service.name} onClick={() => toggleService(attendee.id, service)} className={`flex flex-col transition-all cursor-pointer ${isSelected ? 'border-primary ring-2 ring-primary' : ''}`}>
                                                <div className="flex-grow">
                                                    <CardHeader>
                                                        <CardTitle className="text-base">{service.name}</CardTitle>
                                                        <CardDescription className="text-lg font-bold text-primary">₦{service.price.toLocaleString()}</CardDescription>
                                                    </CardHeader>
                                                </div>
                                                {isSelected && isExtension && (
                                                    <CardContent className="pt-0" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center gap-2">
                                                            <Label htmlFor={`quantity-${attendee.id}-${service.name}`} className="text-sm">Qty:</Label>
                                                            <Select
                                                                defaultValue="1"
                                                                onValueChange={(value) => updateServiceQuantity(attendee.id, service.name, parseInt(value))}
                                                            >
                                                                <SelectTrigger id={`quantity-${attendee.id}-${service.name}`} className="w-20 h-8">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {[...Array(10).keys()].map(i => (
                                                                        <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </CardContent>
                                                )}
                                            </Card>
                                        )
                                    })}
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
        if (!isClient) {
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
                      className="w-full"
                      min={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor="appointment-time" className="flex items-center gap-2">
                        <Clock className="h-5 w-5"/>
                        Appointment Time
                    </Label>
                    {isWeekday ? (
                        <Select value={time} onValueChange={setTime}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a time" />
                            </SelectTrigger>
                            <SelectContent>
                                {weekdayTimes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    ) : (
                        <Input
                            id="appointment-time"
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full"
                        />
                    )}
                  </div>
                  {renderAvailability()}
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
        if (!selectedDateTime) return null; // Should not happen if logic is correct
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <Card>
                    <CardHeader><CardTitle>Confirm Your Appointment</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between"><span className="font-semibold">Date:</span> <span>{format(selectedDateTime, 'PPP')}</span></div>
                        <div className="flex justify-between"><span className="font-semibold">Time:</span> <span>{format(selectedDateTime, 'p')}</span></div>
                        <Separator />
                        {attendees.map((attendee) => (
                            <div key={attendee.id} className="space-y-2">
                                <h4 className="font-semibold">{attendee.isGuest ? `Guest: ${attendee.name}` : attendee.name}</h4>
                                <p className="text-sm text-muted-foreground">{attendee.phone}</p>
                                <ul className="list-disc list-inside text-sm">
                                    {attendee.services.map(s => <li key={s.name}>{s.name} {s.quantity > 1 ? `(x${s.quantity})` : ''} - ₦{(s.price * s.quantity).toLocaleString()}</li>)}
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
  
  const getContinueButton = () => {
      const isConfirmStep = step === 'CONFIRM';
      const isDisabled =
        (step === 'SELECT_SERVICES' && attendees.every(a => a.services.length === 0)) ||
        (step === 'SELECT_DATETIME' && (!selectedDateTime || !isSlotAvailable || isLoadingAppointments)) ||
        (step === 'USER_INFO' && attendees.some(a => !a.name || !a.phone)) ||
        (isConfirmStep && (!termsAccepted || isSubmitting));

       return (
         <Button onClick={isConfirmStep ? handleBooking : handleNextStep} disabled={isDisabled}>
           {isConfirmStep ? (
             isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Booking...</> : 'Book Appointment'
           ) : (
             <>Continue <ChevronRight className="ml-2 h-4 w-4" /></>
           )}
         </Button>
       );
  }

  return (
    <div>
        {renderStep()}
        {step !== 'CHOOSE_TYPE' && (
            <div ref={bottomNavRef} className="flex justify-center gap-4 mt-8">
                <Button variant="outline" onClick={handlePrevStep}><ChevronLeft className="mr-2 h-4 w-4" /> Back</Button>
                {getContinueButton()}
            </div>
        )}
    </div>
  );
}
