export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string
          id: string
          new_values: Json | null
          old_values: Json | null
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: []
      }
      auto_fix_attempts: {
        Row: {
          applied: boolean | null
          confidence_score: number
          created_at: string
          debug_log_id: string
          error_message: string | null
          fix_suggestion: string
          id: string
          success: boolean | null
          updated_at: string
        }
        Insert: {
          applied?: boolean | null
          confidence_score: number
          created_at?: string
          debug_log_id: string
          error_message?: string | null
          fix_suggestion: string
          id?: string
          success?: boolean | null
          updated_at?: string
        }
        Update: {
          applied?: boolean | null
          confidence_score?: number
          created_at?: string
          debug_log_id?: string
          error_message?: string | null
          fix_suggestion?: string
          id?: string
          success?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "auto_fix_attempts_debug_log_id_fkey"
            columns: ["debug_log_id"]
            isOneToOne: false
            referencedRelation: "debug_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          content_id: string
          content_type: string | null
          created_at: string | null
          episode_id: string | null
          id: string
          parent_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          content_id: string
          content_type?: string | null
          created_at?: string | null
          episode_id?: string | null
          id?: string
          parent_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          content_id?: string
          content_type?: string | null
          created_at?: string | null
          episode_id?: string | null
          id?: string
          parent_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creators: {
        Row: {
          bio: string | null
          created_at: string | null
          follower_count: number | null
          id: string
          updated_at: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          follower_count?: number | null
          id?: string
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          follower_count?: number | null
          id?: string
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "creators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      debug_logs: {
        Row: {
          additional_data: Json | null
          auto_fix_attempted: boolean | null
          auto_fix_result: string | null
          created_at: string
          id: string
          level: Database["public"]["Enums"]["log_level"]
          message: string
          resolved: boolean | null
          session_id: string | null
          source: string | null
          stack_trace: string | null
          status: Database["public"]["Enums"]["log_status"] | null
          timestamp: string
          updated_at: string
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          additional_data?: Json | null
          auto_fix_attempted?: boolean | null
          auto_fix_result?: string | null
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["log_level"]
          message: string
          resolved?: boolean | null
          session_id?: string | null
          source?: string | null
          stack_trace?: string | null
          status?: Database["public"]["Enums"]["log_status"] | null
          timestamp?: string
          updated_at?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          additional_data?: Json | null
          auto_fix_attempted?: boolean | null
          auto_fix_result?: string | null
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["log_level"]
          message?: string
          resolved?: boolean | null
          session_id?: string | null
          source?: string | null
          stack_trace?: string | null
          status?: Database["public"]["Enums"]["log_status"] | null
          timestamp?: string
          updated_at?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      debug_settings: {
        Row: {
          allowed_log_levels: Database["public"]["Enums"]["log_level"][] | null
          auto_fix_confidence_threshold: number | null
          auto_fix_enabled: boolean | null
          created_at: string
          debug_mode_enabled: boolean | null
          id: string
          log_retention_days: number | null
          max_logs_per_session: number | null
          updated_at: string
        }
        Insert: {
          allowed_log_levels?: Database["public"]["Enums"]["log_level"][] | null
          auto_fix_confidence_threshold?: number | null
          auto_fix_enabled?: boolean | null
          created_at?: string
          debug_mode_enabled?: boolean | null
          id?: string
          log_retention_days?: number | null
          max_logs_per_session?: number | null
          updated_at?: string
        }
        Update: {
          allowed_log_levels?: Database["public"]["Enums"]["log_level"][] | null
          auto_fix_confidence_threshold?: number | null
          auto_fix_enabled?: boolean | null
          created_at?: string
          debug_mode_enabled?: boolean | null
          id?: string
          log_retention_days?: number | null
          max_logs_per_session?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      episodes: {
        Row: {
          cloudflare_video_id: string | null
          comments_count: number | null
          created_at: string | null
          description: string | null
          duration: number | null
          episode_number: number
          id: string
          is_premium: boolean | null
          likes: number | null
          migrated_to_cloudflare: boolean | null
          series_id: string
          status: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_url: string
          views: number | null
        }
        Insert: {
          cloudflare_video_id?: string | null
          comments_count?: number | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          episode_number: number
          id?: string
          is_premium?: boolean | null
          likes?: number | null
          migrated_to_cloudflare?: boolean | null
          series_id: string
          status?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_url: string
          views?: number | null
        }
        Update: {
          cloudflare_video_id?: string | null
          comments_count?: number | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          episode_number?: number
          id?: string
          is_premium?: boolean | null
          likes?: number | null
          migrated_to_cloudflare?: boolean | null
          series_id?: string
          status?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "episodes_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      global_settings: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      interactions: {
        Row: {
          created_at: string | null
          id: string
          interaction_type: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          interaction_type: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          interaction_type?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string | null
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string | null
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string | null
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_count: number | null
          content: string | null
          created_at: string | null
          id: string
          likes_count: number | null
          media_type: string | null
          media_url: string | null
          post_type: string
          privacy_setting: string | null
          reshared_episode_id: string | null
          reshared_post_id: string | null
          reshares_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          likes_count?: number | null
          media_type?: string | null
          media_url?: string | null
          post_type?: string
          privacy_setting?: string | null
          reshared_episode_id?: string | null
          reshared_post_id?: string | null
          reshares_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          likes_count?: number | null
          media_type?: string | null
          media_url?: string | null
          post_type?: string
          privacy_setting?: string | null
          reshared_episode_id?: string | null
          reshared_post_id?: string | null
          reshares_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_reshared_episode_id_fkey"
            columns: ["reshared_episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_reshared_post_id_fkey"
            columns: ["reshared_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          default_post_privacy: string | null
          display_name: string | null
          email_visible: boolean | null
          id: string
          language_preference: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          default_post_privacy?: string | null
          display_name?: string | null
          email_visible?: boolean | null
          id: string
          language_preference?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          default_post_privacy?: string | null
          display_name?: string | null
          email_visible?: boolean | null
          id?: string
          language_preference?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action_type: string
          attempts: number | null
          created_at: string
          id: string
          ip_address: unknown | null
          user_id: string | null
          window_start: string
        }
        Insert: {
          action_type: string
          attempts?: number | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          user_id?: string | null
          window_start?: string
        }
        Update: {
          action_type?: string
          attempts?: number | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          user_id?: string | null
          window_start?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string | null
          description: string | null
          event_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      series: {
        Row: {
          created_at: string | null
          creator_id: string
          description: string | null
          episode_count: number | null
          genre: string | null
          id: string
          is_premium: boolean | null
          language: string | null
          source_platform: string | null
          status: string | null
          thumbnail_url: string | null
          title: string
          total_views: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          description?: string | null
          episode_count?: number | null
          genre?: string | null
          id?: string
          is_premium?: boolean | null
          language?: string | null
          source_platform?: string | null
          status?: string | null
          thumbnail_url?: string | null
          title: string
          total_views?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          description?: string | null
          episode_count?: number | null
          genre?: string | null
          id?: string
          is_premium?: boolean | null
          language?: string | null
          source_platform?: string | null
          status?: string | null
          thumbnail_url?: string | null
          title?: string
          total_views?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "series_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          creator_id: string
          follower_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          follower_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          follower_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      watch_progress: {
        Row: {
          created_at: string
          duration_seconds: number
          episode_id: string
          id: string
          last_watched_at: string
          progress_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number
          episode_id: string
          id?: string
          last_watched_at?: string
          progress_seconds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number
          episode_id?: string
          id?: string
          last_watched_at?: string
          progress_seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_watch_progress_episode_id"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_exists: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      audit_admin_action: {
        Args: {
          action_type_param: string
          new_values_param?: Json
          old_values_param?: Json
          target_id_param?: string
          target_table_param?: string
        }
        Returns: undefined
      }
      bootstrap_admin: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      calculate_game_result: {
        Args: { round_uuid: string }
        Returns: Json
      }
      can_user_view_creator: {
        Args: { creator_id_param: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          action_type_param: string
          max_attempts?: number
          window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_old_debug_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      comprehensive_cleanup: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_betting_stats: {
        Args: { user_uuid?: string }
        Returns: {
          total_bets: number
          total_users: number
          total_volume: number
          user_bets: number
          user_winnings: number
        }[]
      }
      get_creator_public_info: {
        Args: { creator_id_param: string }
        Returns: {
          bio: string
          created_at: string
          follower_count: number
          id: string
          verified: boolean
        }[]
      }
      get_debug_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_my_betting_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          total_bets_placed: number
          total_winnings: number
          username: string
          wallet_balance: number
        }[]
      }
      get_public_betting_leaderboard: {
        Args: { limit_count?: number }
        Returns: {
          rank_position: number
          total_bets_placed: number
          total_winnings: number
          username: string
        }[]
      }
      get_public_profile_info: {
        Args: { profile_id: string }
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          display_name: string
          id: string
          username: string
        }[]
      }
      has_current_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_episode_views: {
        Args: { episode_id_param: string }
        Returns: undefined
      }
      log_security_event: {
        Args: {
          p_description?: string
          p_event_type: string
          p_metadata?: Json
          p_severity?: string
          p_user_id: string
        }
        Returns: undefined
      }
      mock_deposit: {
        Args: { amount: number }
        Returns: Json
      }
      process_round_payouts: {
        Args: { round_uuid: string }
        Returns: Json
      }
      update_global_theme: {
        Args: { theme_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      log_level: "debug" | "info" | "warn" | "error" | "critical"
      log_status: "new" | "reviewing" | "fixing" | "fixed" | "ignored"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      log_level: ["debug", "info", "warn", "error", "critical"],
      log_status: ["new", "reviewing", "fixing", "fixed", "ignored"],
    },
  },
} as const
