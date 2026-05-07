export interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'master_admin' | 'sub_admin' | 'owner' | 'collaborator';
  business_id: string | null;
  totp_enabled: boolean;
}

export interface AuthResponse {
  token: string;
  user: { id: string; role: string; business_id: string | null };
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  subscription_status: string;
  trial_ends_at: string;
  plan_id: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  business_id: string;
  name: string;
  color: string;
  icon: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  business_id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  price_type: 'fixed' | 'starting_at' | 'on_request';
  duration_minutes: number;
  is_active: boolean;
  sort_order: number;
  category?: Pick<Category, 'id' | 'name' | 'color'>;
  created_at: string;
  updated_at: string;
}

export interface Collaborator {
  id: string;
  business_id: string;
  profile_id: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  cpf: string | null;
  birth_date: string | null;
  address: string | null;
  avatar_url: string | null;
  base_commission: number;
  work_start: string;
  work_end: string;
  notes: string | null;
  is_active: boolean;
  collaborator_services?: CollaboratorService[];
  created_at: string;
  updated_at: string;
}

export interface CollaboratorService {
  id: string;
  collaborator_id: string;
  service_id: string;
  commission: number | null;
  is_active: boolean;
  service?: Pick<Service, 'id' | 'name' | 'price' | 'duration_minutes' | 'category_id'>;
}

export interface Client {
  id: string;
  business_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  birth_date: string | null;
  source: string | null;
  notes: string | null;
  is_active: boolean;
  appointments?: Appointment[];
  created_at: string;
  updated_at: string;
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  business_id: string;
  client_id: string;
  collaborator_id: string;
  date: string;
  start_time: string;
  end_time: string;
  total_price: number;
  total_duration: number;
  status: AppointmentStatus;
  payment_method: string | null;
  notes: string | null;
  source: string;
  client?: Client;
  collaborator?: Pick<Collaborator, 'id' | 'name'>;
  appointment_services?: AppointmentService[];
  created_at: string;
  updated_at: string;
}

export interface AppointmentService {
  id: string;
  appointment_id: string;
  service_id: string;
  price: number;
  duration_minutes: number;
  service?: Pick<Service, 'id' | 'name'>;
}

export interface DashboardStats {
  appointments: number;
  revenue: number;
  new_clients: number;
  no_show_rate: number;
}

export interface CollaboratorPerformanceData {
  collaborator_id: string;
  collaborator_name: string;
  total_appointments: number;
  total_revenue: number;
}
