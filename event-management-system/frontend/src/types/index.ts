export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'organizer' | 'attendee' | 'vendor';
  phone_number?: string;
  profile_picture?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string;
  venue: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  capacity: number;
  ticket_price: number;
  image_url?: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  is_featured: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: number;
  booking_reference: string;
  user_id: number;
  event_id: number;
  number_of_tickets: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: 'mpesa' | 'card' | 'cash';
  payment_reference?: string;
  mpesa_code?: string;
  paid_at?: string;
  booked_at: string;
  updated_at: string;
}

export interface Vendor {
  id: number;
  business_name: string;
  business_type: string;
  description?: string;
  contact_email: string;
  contact_phone: string;
  website?: string;
  logo_url?: string;
  user_id: number;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreference {
  id: number;
  user_id: number;
  preferred_categories: string[];
  preferred_cities: string[];
  price_min?: number;
  price_max?: number;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface AuthResponse {
  access_token: string;
  message: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
