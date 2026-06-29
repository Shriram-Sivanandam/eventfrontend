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
  host_user_id: string;
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
  has_rated?: boolean;
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
  has_rated?: boolean;
};

export type Dashboard = {
  event: Event;
  total_registered: number;
  accepted: number;
  pending: number;
  rejected: number;
  registrants: Registrant[];
};

export type PastEvent = {
  id: string;
  host_user_id: string;
  title: string;
  location?: string;
  city?: string;
  event_start: string;
  image_url?: string;
  price: number;
  avg_rating?: number;
  rating_count: number;
};

export type HostProfile = {
  user_id: string;
  name?: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  city?: string;
  instagram?: string;
  twitter?: string;
  gender?: string;
  age?: number;
  hosting_rating?: number;
  attendee_rating?: number;
  total_hosted: number;
  total_attended: number;
  total_ratings: number;
  past_events: PastEvent[];
};

export type Tag = {
  id: string;
  name: string;
};
