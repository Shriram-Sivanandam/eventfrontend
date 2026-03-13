export type FormState = {
  title: string;
  description: string;
  location: string;
  address_line_one: string;
  city: string;
  pincode: string;
  maps_link: string;
  date: Date;
  duration_minutes: string;
  price: string;
  capacity: string;
  things_to_bring: string;
  things_provided: string;
};

export type ErrorState = Partial<Record<keyof FormState, string>>;

export type Event = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  city?: string;
  address_line_one?: string;
  pincode?: string;
  maps_link?: string;
  event_start: string;
  duration_minutes?: number;
  price: number;
  capacity?: number;
  image_url?: string;
  registrant_count?: number;
  things_to_bring?: string;
  things_provided?: string;
};

export type FilterTab = 'all' | 'pending' | 'accepted' | 'rejected';
export type RegistrantStatus = 'pending' | 'accepted' | 'rejected';

export type Registrant = {
  registration_id: string;
  user_id: string;
  name?: string;
  email: string;
  avatar_url?: string;
  status: RegistrantStatus;
  registered_at: string;
};

export type Dashboard = {
  event: Event;
  total_registered: number;
  accepted: number;
  pending: number;
  rejected: number;
  registrants: Registrant[];
};
