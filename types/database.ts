// Row/Insert/Update are inlined directly in Database (matching the shape
// `supabase gen types typescript` produces) rather than referencing named
// interfaces. supabase-js's insert()/update() generics fail to resolve
// (silently collapsing to `never`) when a table's Row/Insert/Update point
// at an external type alias instead of an object literal — a known sharp
// edge with hand-written Database types on supabase-js 2.7x+.
export interface Database {
  public: {
    Tables: {
      locations: {
        Row: {
          id: string;
          name: string;
          type: "hospital" | "clinic" | "mfc" | "post";
          lat: number;
          lng: number;
          city: string;
          address: string | null;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: "hospital" | "clinic" | "mfc" | "post";
          lat: number;
          lng: number;
          city?: string;
          address?: string | null;
          phone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: "hospital" | "clinic" | "mfc" | "post";
          lat?: number;
          lng?: number;
          city?: string;
          address?: string | null;
          phone?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      departments: {
        Row: {
          id: string;
          location_id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          location_id: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          location_id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "departments_location_id_fkey";
            columns: ["location_id"];
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
        ];
      };
      queue_reports: {
        Row: {
          id: string;
          location_id: string;
          department_id: string | null;
          load_level: "low" | "medium" | "high";
          people_count: number | null;
          device_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          location_id: string;
          department_id?: string | null;
          load_level: "low" | "medium" | "high";
          people_count?: number | null;
          device_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          location_id?: string;
          department_id?: string | null;
          load_level?: "low" | "medium" | "high";
          people_count?: number | null;
          device_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "queue_reports_location_id_fkey";
            columns: ["location_id"];
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "queue_reports_department_id_fkey";
            columns: ["department_id"];
            referencedRelation: "departments";
            referencedColumns: ["id"];
          },
        ];
      };
      report_confirmations: {
        Row: {
          id: string;
          report_id: string;
          device_id: string;
          vote: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          device_id: string;
          vote: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          report_id?: string;
          device_id?: string;
          vote?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "report_confirmations_report_id_fkey";
            columns: ["report_id"];
            referencedRelation: "queue_reports";
            referencedColumns: ["id"];
          },
        ];
      };
      location_notes: {
        Row: {
          id: string;
          location_id: string;
          text: string | null;
          photo_url: string | null;
          device_id: string;
          hidden: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          location_id: string;
          text?: string | null;
          photo_url?: string | null;
          device_id: string;
          hidden?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          location_id?: string;
          text?: string | null;
          photo_url?: string | null;
          device_id?: string;
          hidden?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "location_notes_location_id_fkey";
            columns: ["location_id"];
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
  };
}

export type Location = Database["public"]["Tables"]["locations"]["Row"];
export type LocationType = Location["type"];

export type QueueReport = Database["public"]["Tables"]["queue_reports"]["Row"];
export type LoadLevel = QueueReport["load_level"];

export type Department = Database["public"]["Tables"]["departments"]["Row"];

export type LocationNote = Database["public"]["Tables"]["location_notes"]["Row"];

export type ReportConfirmation = Database["public"]["Tables"]["report_confirmations"]["Row"];
