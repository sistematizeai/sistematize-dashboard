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
