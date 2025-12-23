export interface Service {
  name: string;
  price: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  services: Service[];
}
