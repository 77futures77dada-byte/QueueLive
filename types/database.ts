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
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: "hospital" | "clinic" | "mfc" | "post";
          lat: number;
          lng: number;
          city?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: "hospital" | "clinic" | "mfc" | "post";
          lat?: number;
          lng?: number;
          city?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      queue_reports: {
        Row: {
          id: string;
          location_id: string;
          load_level: "low" | "medium" | "high";
          people_count: number | null;
          device_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          location_id: string;
          load_level: "low" | "medium" | "high";
          people_count?: number | null;
          device_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          location_id?: string;
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
