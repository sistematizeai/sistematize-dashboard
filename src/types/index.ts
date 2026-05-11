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

export interface BusinessHours {
  [day: string]: { open: string; close: string; enabled: boolean; lunch_start?: string; lunch_end?: string };
}

export type HeroLayout = 'split' | 'fullcover' | 'minimal';

export interface BookingSettings {
  min_interval_minutes: number;
  min_advance_hours: number;
  max_advance_days: number;
  allow_overlap: boolean;
  auto_confirm: boolean;
  hero_layout?: HeroLayout;
  show_hero_badges?: boolean;
}

export interface NotificationSettings {
  email_reminder_enabled: boolean;
  reminder_advance_hours: number;
  confirmation_template: string;
  reminder_template: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  cep: string | null;
  cnpj: string | null;
  description: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  cover_image_url: string | null;
  welcome_message: string | null;
  primary_color: string | null;
  cancellation_policy: string | null;
  booking_enabled: boolean;
  booking_settings: BookingSettings | null;
  notification_settings: NotificationSettings | null;
  business_hours: BusinessHours | null;
  subscription_status: string;
  trial_ends_at: string;
  plan_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
  image_url: string | null;
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
  service_id: string;
  commission: number | null;
  service?: Pick<Service, 'id' | 'name' | 'category_id'>;
}

export interface CollaboratorSchedule {
  day_of_week: number;
  day_name: string;
  is_working: boolean;
  work_start: string;
  work_end: string;
  lunch_start: string | null;
  lunch_end: string | null;
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
  appointment_count?: number;
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
  ticket_medio: number;
  trends: {
    appointments: number | null;
    revenue: number | null;
    new_clients: number | null;
    no_show_rate: number | null;
    ticket_medio: number | null;
  };
}

export interface CollaboratorPerformanceData {
  id: string;
  name: string;
  avatar_url: string | null;
  appointments_count: number;
  revenue: number;
  ticket_medio: number;
}

export interface RevenueChartPoint {
  date: string;
  revenue: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface ServiceRevenue {
  name: string;
  revenue: number;
}

export interface PopularService {
  name: string;
  count: number;
}

export interface DailyAppointmentPoint {
  date: string;
  label: string;
  total: number;
  completed: number;
  cancelled: number;
  is_today: boolean;
}

export interface PeakHourSlot {
  hour: string;
  count: number;
  percentage: number;
}

export interface PeakHourDay {
  day: string;
  hours: PeakHourSlot[];
}

export interface Combo {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number;
  discount_percent: number;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  services?: Pick<Service, 'id' | 'name' | 'price' | 'duration_minutes'>[];
  created_at: string;
  updated_at: string;
}
