import { BookingFlow } from "@/components/booking-flow";

export default function AppointmentsPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Book an Appointment</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Schedule your next hair appointment with us.
        </p>
      </div>
      <BookingFlow />
    </div>
  );
}
