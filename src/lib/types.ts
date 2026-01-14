export interface Service {
  name: string;
  price: number;
  quantity?: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  services: Service[];
}

export interface BookedAppointment {
    id?: string;
    dateTime: string;
    totalCost: number;
    attendees: {
        name: string;
        phone: string;
        services: {
            name: string;
            quantity: number;
            price: number;
        }[];
    }[];
}
