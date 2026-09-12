export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      anime: {
        Row: {
          id: string;
          slug: string;
          title: string;
          japanese_title: string | null;
          poster: string | null;
          score: number | null;
          status: string | null;
          type: string | null;
          genres: string[] | null;
          synopsis: string | null;
          studio: string | null;
          season: string | null;
          total_episodes: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          japanese_title?: string | null;
          poster?: string | null;
          score?: number | null;
          status?: string | null;
          type?: string | null;
          genres?: string[] | null;
          synopsis?: string | null;
          studio?: string | null;
          season?: string | null;
          total_episodes?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          japanese_title?: string | null;
          poster?: string | null;
          score?: number | null;
          status?: string | null;
          type?: string | null;
          genres?: string[] | null;
          synopsis?: string | null;
          studio?: string | null;
          season?: string | null;
          total_episodes?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      episodes: {
        Row: {
          id: string;
          anime_slug: string;
          episode_number: number;
          title: string | null;
          stream_urls: Json | null;
          download_urls: Json | null;
          released_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          anime_slug: string;
          episode_number: number;
          title?: string | null;
          stream_urls?: Json | null;
          download_urls?: Json | null;
          released_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          anime_slug?: string;
          episode_number?: number;
          title?: string | null;
          stream_urls?: Json | null;
          download_urls?: Json | null;
          released_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "episodes_anime_slug_fkey";
            columns: ["anime_slug"];
            isOneToOne: false;
            referencedRelation: "anime";
            referencedColumns: ["slug"];
          }
        ];
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          anime_slug: string;
          anime_title: string;
          anime_poster: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          anime_slug: string;
          anime_title: string;
          anime_poster?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          anime_slug?: string;
          anime_title?: string;
          anime_poster?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookmarks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      watch_history: {
        Row: {
          id: string;
          user_id: string;
          anime_slug: string;
          anime_title: string;
          anime_poster: string | null;
          episode_number: number;
          progress_seconds: number;
          duration_seconds: number;
          completed: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          anime_slug: string;
          anime_title: string;
          anime_poster?: string | null;
          episode_number: number;
          progress_seconds?: number;
          duration_seconds?: number;
          completed?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          anime_slug?: string;
          anime_title?: string;
          anime_poster?: string | null;
          episode_number?: number;
          progress_seconds?: number;
          duration_seconds?: number;
          completed?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "watch_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          anime_slug: string;
          episode_number: number | null;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          anime_slug: string;
          episode_number?: number | null;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          anime_slug?: string;
          episode_number?: number | null;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;
