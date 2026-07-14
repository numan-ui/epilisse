// Hand-written to match supabase/migrations/0001_init.sql. Once a real Supabase
// project is linked, regenerate with:
//   supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts
// and reconcile any drift against this file.

export type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled';
export type CustomerGender = 'herr' | 'frau' | 'keine_angabe';
export type CustomerClass = 'A' | 'B' | 'C';
export type CampaignTargetType = 'all' | 'category' | 'customers';
export type CampaignStatus = 'draft' | 'sending' | 'sent' | 'failed';
export type RecipientStatus = 'pending' | 'sent' | 'failed';
export type ConsentKind = 'datenschutz' | 'behandlung' | 'marketing';
export type ConsentAction = 'granted' | 'withdrawn';

export interface Database {
  public: {
    Tables: {
      consent_log: {
        Row: {
          id: string; customer_id: string; kind: ConsentKind; action: ConsentAction;
          source: string; created_at: string;
        };
        Insert: {
          id?: string; customer_id: string; kind: ConsentKind; action: ConsentAction;
          source: string; created_at?: string;
        };
        Update: Partial<{ kind: ConsentKind; action: ConsentAction; source: string }>;
        Relationships: [
          {
            foreignKeyName: 'consent_log_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
        ];
      };
      categories: {
        Row: { id: string; name: string; created_at: string };
        Insert: { id: string; name: string; created_at?: string };
        Update: Partial<{ id: string; name: string }>;
        Relationships: [];
      };
      customers: {
        Row: {
          id: string; name: string; phone: string | null; email: string | null;
          since: string; tags: string[]; notes: string; gender: CustomerGender;
          is_active: boolean; class: CustomerClass | null; category: string | null;
          consent_datenschutz_at: string | null; consent_behandlung_at: string | null;
          consent_marketing_at: string | null; consent_request_last_sent_at: string | null;
          consent_request_behandlung_sent_at: string | null;
          created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; name: string; phone?: string | null; email?: string | null;
          since?: string; tags?: string[]; notes?: string; gender?: CustomerGender;
          is_active?: boolean; class?: CustomerClass | null; category?: string | null;
          consent_datenschutz_at?: string | null; consent_behandlung_at?: string | null;
          consent_marketing_at?: string | null; consent_request_last_sent_at?: string | null;
          consent_request_behandlung_sent_at?: string | null;
        };
        Update: Partial<{
          name: string; phone: string | null; email: string | null;
          since: string; tags: string[]; notes: string; updated_at: string; gender: CustomerGender;
          is_active: boolean; class: CustomerClass | null; category: string | null;
          consent_datenschutz_at: string | null; consent_behandlung_at: string | null;
          consent_marketing_at: string | null; consent_request_last_sent_at: string | null;
          consent_request_behandlung_sent_at: string | null;
        }>;
        Relationships: [
          {
            foreignKeyName: 'customers_category_fkey';
            columns: ['category'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
      appointments: {
        Row: {
          id: string; customer_id: string; category_id: string; service_name: string;
          price: number | null;
          starts_at: string; duration_min: number; status: AppointmentStatus; notes: string;
          reminder_sent: boolean;
          created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; customer_id: string; category_id: string; service_name: string;
          price?: number | null;
          starts_at: string; duration_min?: number; status?: AppointmentStatus; notes?: string;
          reminder_sent?: boolean;
        };
        Update: Partial<{
          customer_id: string; category_id: string; service_name: string; price: number | null;
          starts_at: string; duration_min: number; status: AppointmentStatus; notes: string;
          reminder_sent: boolean; updated_at: string;
        }>;
        Relationships: [
          {
            foreignKeyName: 'appointments_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'appointments_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
      category_follow_up_settings: {
        Row: {
          category_id: string; enabled: boolean;
          renewal_interval_weeks: number; reminder_lead_days: number; updated_at: string;
        };
        Insert: {
          category_id: string; enabled?: boolean;
          renewal_interval_weeks?: number; reminder_lead_days?: number;
        };
        Update: Partial<{ enabled: boolean; renewal_interval_weeks: number; reminder_lead_days: number; updated_at: string }>;
        Relationships: [
          {
            foreignKeyName: 'category_follow_up_settings_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: true;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
      campaigns: {
        Row: {
          id: string; name: string | null; title: string; message: string; discount_label: string | null;
          target_type: CampaignTargetType; target_category_id: string | null;
          status: CampaignStatus; created_at: string; sent_at: string | null;
        };
        Insert: {
          id?: string; name?: string | null; title: string; message: string; discount_label?: string | null;
          target_type: CampaignTargetType; target_category_id?: string | null;
          status?: CampaignStatus;
        };
        Update: Partial<{ name: string | null; status: CampaignStatus; sent_at: string | null }>;
        Relationships: [
          {
            foreignKeyName: 'campaigns_target_category_id_fkey';
            columns: ['target_category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
      campaign_recipients: {
        Row: {
          id: string; campaign_id: string; customer_id: string;
          status: RecipientStatus; sent_at: string | null; error: string | null;
        };
        Insert: {
          id?: string; campaign_id: string; customer_id: string;
          status?: RecipientStatus; sent_at?: string | null; error?: string | null;
        };
        Update: Partial<{ status: RecipientStatus; sent_at: string | null; error: string | null }>;
        Relationships: [
          {
            foreignKeyName: 'campaign_recipients_campaign_id_fkey';
            columns: ['campaign_id'];
            isOneToOne: false;
            referencedRelation: 'campaigns';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'campaign_recipients_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
        ];
      };
      blocked_slots: {
        Row: { id: string; starts_at: string; duration_min: number; reason: string; created_at: string };
        Insert: { id?: string; starts_at: string; duration_min?: number; reason?: string };
        Update: never;
        Relationships: [];
      };
      email_sends: {
        Row: {
          id: string; kind: 'follow_up' | 'appointment_reminder' | 'campaign' | 'appointment_confirmation' | 'consent_request';
          customer_id: string | null; recipient: string | null; sent_at: string;
        };
        Insert: {
          id?: string; kind: 'follow_up' | 'appointment_reminder' | 'campaign' | 'appointment_confirmation' | 'consent_request';
          customer_id?: string | null; recipient?: string | null; sent_at?: string;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: 'email_sends_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
        ];
      };
      business_hours: {
        Row: {
          weekday: number; day_label: string; open_time: string; close_time: string;
          closed: boolean; updated_at: string;
        };
        Insert: {
          weekday: number; day_label: string; open_time: string; close_time: string;
          closed?: boolean;
        };
        Update: Partial<{ day_label: string; open_time: string; close_time: string; closed: boolean; updated_at: string }>;
        Relationships: [];
      };
      follow_up_reminders: {
        Row: {
          id: string; customer_id: string; category_id: string;
          appointment_id: string; sent_at: string;
        };
        Insert: {
          id?: string; customer_id: string; category_id: string;
          appointment_id: string; sent_at?: string;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: 'follow_up_reminders_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'follow_up_reminders_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'follow_up_reminders_appointment_id_fkey';
            columns: ['appointment_id'];
            isOneToOne: false;
            referencedRelation: 'appointments';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      latest_appointments_by_category: {
        Args: { p_category_id: string };
        Returns: { appointment_id: string; customer_id: string; starts_at: string }[];
      };
    };
  };
}
