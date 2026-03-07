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
  location?: string;
  city?: string;
  event_start: string;
  event_end?: string;
  price: number;
  capacity?: number;
  image_url?: string;
  registrant_count?: number;
};
