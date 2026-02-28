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
