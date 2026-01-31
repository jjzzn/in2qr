import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password?: string;
          name?: string;
          created_at?: string;
        };
      };
      qr_codes: {
        Row: {
          id: string;
          user_id: string | null;
          qr_type: string;
          title: string;
          content: any;
          design_settings: any;
          short_code: string;
          redirect_url: string;
          is_dynamic: boolean;
          scan_count: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          qr_type: string;
          title: string;
          content: any;
          design_settings?: any;
          short_code: string;
          redirect_url: string;
          is_dynamic?: boolean;
          scan_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          qr_type?: string;
          title?: string;
          content?: any;
          design_settings?: any;
          short_code?: string;
          redirect_url?: string;
          is_dynamic?: boolean;
          scan_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      qr_scans: {
        Row: {
          id: string;
          qr_code_id: string | null;
          scanned_at: string;
          user_agent: string | null;
          ip_address: string | null;
          country: string | null;
          city: string | null;
        };
        Insert: {
          id?: string;
          qr_code_id?: string | null;
          scanned_at?: string;
          user_agent?: string | null;
          ip_address?: string | null;
          country?: string | null;
          city?: string | null;
        };
        Update: {
          id?: string;
          qr_code_id?: string | null;
          scanned_at?: string;
          user_agent?: string | null;
          ip_address?: string | null;
          country?: string | null;
          city?: string | null;
        };
      };
    };
  };
};
