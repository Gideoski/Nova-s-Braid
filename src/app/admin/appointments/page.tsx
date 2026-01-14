'use client';

import { useMemo } from 'react';
import { useFirestore, useCollection, useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ServerCrash, CalendarOff } from 'lucide-react';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AdminAppointmentsPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const appointmentsRef = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'appointments');
  }, [firestore]);
  
  const appointmentsQuery = useMemo(() => {
      if (!appointmentsRef) return null;
      return query(appointmentsRef, orderBy('dateTime', 'desc'));
  }, [appointmentsRef]);

  const { data: appointments, loading, error } = useCollection(appointmentsQuery);

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-primary">Admin: All Appointments</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          View all bookings made through the website.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
          <CardDescription>A list of all scheduled appointments.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                      <p className="mt-2 text-muted-foreground">Loading Appointments...</p>
                    </TableCell>
                  </TableRow>
                )}
                {error && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-destructive">
                       <ServerCrash className="h-8 w-8 mx-auto" />
                      <p className="mt-2">Error loading appointments.</p>
                      <p className="text-xs text-muted-foreground">{error.message}</p>
                    </TableCell>
                  </TableRow>
                )}
                {!loading && !error && (!appointments || appointments.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <CalendarOff className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">No appointments have been booked yet.</p>
                    </TableCell>
                  </TableRow>
                )}
                {!loading && appointments && appointments.map((app: any) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.dateTime ? format(app.dateTime.toDate(), 'PPP p') : 'Invalid Date'}</TableCell>
                    <TableCell>
                      {app.attendees?.map((a: any) => a.name).join(', ') ?? 'N/A'}
                    </TableCell>
                    <TableCell>
                      <ul className="list-disc list-inside">
                        {app.attendees?.flatMap((a: any) => a.services.map((s: any, i: number) => (
                          <li key={`${a.name}-${s.name}-${i}`}>{s.name}</li>
                        )))}
                      </ul>
                    </TableCell>
                    <TableCell className="text-right font-mono">₦{app.totalCost?.toLocaleString() ?? '0'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
