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

    