export interface Barber {
  id: number;
  name: string;
  avatar: string;
  specialty: string;
  rating: number;
}

export interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
}

export interface Appointment {
  id: number;
  barberId: number;
  barberName: string;
  serviceId: number;
  serviceName: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  status: 'confirmed' | 'cancelled' | 'completed';
}