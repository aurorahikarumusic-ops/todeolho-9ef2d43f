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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_emoji: string
          badge_key: string
          badge_name: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_emoji?: string
          badge_key: string
          badge_name: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_emoji?: string
          badge_key?: string
          badge_name?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      children: {
        Row: {
          allergies: string | null
          birth_date: string | null
          created_at: string
          doctor_name: string | null
          family_id: string
          id: string
          name: string
          photo_url: string | null
          school: string | null
          updated_at: string
        }
        Insert: {
          allergies?: string | null
          birth_date?: string | null
          created_at?: string
          doctor_name?: string | null
          family_id: string
          id?: string
          name: string
          photo_url?: string | null
          school?: string | null
          updated_at?: string
        }
        Update: {
          allergies?: string | null
          birth_date?: string | null
          created_at?: string
          doctor_name?: string | null
          family_id?: string
          id?: string
          name?: string
          photo_url?: string | null
          school?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      confessions: {
        Row: {
          content: string
          created_at: string
          family_id: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          family_id: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          family_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_missions: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          mission_date: string
          mission_text: string
          points_awarded: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          mission_date?: string
          mission_text: string
          points_awarded?: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          mission_date?: string
          mission_text?: string
          points_awarded?: number
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          event_date: string
          event_type: string
          family_id: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          event_date: string
          event_type?: string
          family_id: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          event_date?: string
          event_type?: string
          family_id?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      grandma_suggestions: {
        Row: {
          adopted_by: string | null
          adopted_family_id: string | null
          created_at: string
          description: string | null
          family_id: string | null
          id: string
          response_by: string | null
          response_comment: string | null
          status: string
          suggestion_type: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          adopted_by?: string | null
          adopted_family_id?: string | null
          created_at?: string
          description?: string | null
          family_id?: string | null
          id?: string
          response_by?: string | null
          response_comment?: string | null
          status?: string
          suggestion_type?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          adopted_by?: string | null
          adopted_family_id?: string | null
          created_at?: string
          description?: string | null
          family_id?: string | null
          id?: string
          response_by?: string | null
          response_comment?: string | null
          status?: string
          suggestion_type?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      love_letters: {
        Row: {
          content: string
          created_at: string
          date_label: string | null
          family_id: string | null
          id: string
          include_signature: boolean
          opened_at: string | null
          paid: boolean
          recipient_id: string | null
          recipient_name: string | null
          saved_by_recipient: boolean
          sender_id: string
          sender_name: string | null
          sent_at: string
          stripe_payment_id: string | null
          tone: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          date_label?: string | null
          family_id?: string | null
          id?: string
          include_signature?: boolean
          opened_at?: string | null
          paid?: boolean
          recipient_id?: string | null
          recipient_name?: string | null
          saved_by_recipient?: boolean
          sender_id: string
          sender_name?: string | null
          sent_at?: string
          stripe_payment_id?: string | null
          tone?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          date_label?: string | null
          family_id?: string | null
          id?: string
          include_signature?: boolean
          opened_at?: string | null
          paid?: boolean
          recipient_id?: string | null
          recipient_name?: string | null
          saved_by_recipient?: boolean
          sender_id?: string
          sender_name?: string | null
          sent_at?: string
          stripe_payment_id?: string | null
          tone?: string
          updated_at?: string
        }
        Relationships: []
      }
      mom_ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rated_by: string
          stars: number
          user_id: string
          week_start: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rated_by: string
          stars: number
          user_id: string
          week_start: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rated_by?: string
          stars?: number
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      monthly_challenges: {
        Row: {
          badge_emoji: string | null
          badge_name: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
          created_by: string
          deadline: string
          description: string | null
          family_id: string
          id: string
          success_criteria: string | null
          title: string
          updated_at: string
        }
        Insert: {
          badge_emoji?: string | null
          badge_name?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by: string
          deadline: string
          description?: string | null
          family_id: string
          id?: string
          success_criteria?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          badge_emoji?: string | null
          badge_name?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string
          deadline?: string
          description?: string | null
          family_id?: string
          id?: string
          success_criteria?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pearl_posts: {
        Row: {
          content: string
          created_at: string
          display_name: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          display_name?: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          display_name?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      pearl_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pearl_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "pearl_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          family_code: string | null
          family_id: string | null
          id: string
          last_active_at: string | null
          points: number
          push_subscription: Json | null
          role: string
          streak_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          family_code?: string | null
          family_id?: string | null
          id?: string
          last_active_at?: string | null
          points?: number
          push_subscription?: Json | null
          role?: string
          streak_days?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          family_code?: string | null
          family_id?: string | null
          id?: string
          last_active_at?: string | null
          points?: number
          push_subscription?: Json | null
          role?: string
          streak_days?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          created_at: string
          id: string
          subscription: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          subscription: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          subscription?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ranking_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ranking_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "ranking_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_groups: {
        Row: {
          created_at: string
          created_by: string
          id: string
          invite_code: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          invite_code?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          invite_code?: string
          name?: string
        }
        Relationships: []
      }
      redemption_events: {
        Row: {
          created_at: string
          dismissed_at: string | null
          id: string
          letter_id: string | null
          shown_at: string
          trigger_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dismissed_at?: string | null
          id?: string
          letter_id?: string | null
          shown_at?: string
          trigger_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          dismissed_at?: string | null
          id?: string
          letter_id?: string | null
          shown_at?: string
          trigger_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redemption_events_letter_id_fkey"
            columns: ["letter_id"]
            isOneToOne: false
            referencedRelation: "love_letters"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          category: string
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          family_id: string
          id: string
          mom_approved: boolean | null
          mom_reprove_comment: string | null
          photo_proof_url: string | null
          points: number
          proof_required: boolean
          rescued_by_mom: boolean
          title: string
          updated_at: string
          urgency: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          family_id: string
          id?: string
          mom_approved?: boolean | null
          mom_reprove_comment?: string | null
          photo_proof_url?: string | null
          points?: number
          proof_required?: boolean
          rescued_by_mom?: boolean
          title: string
          updated_at?: string
          urgency?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          family_id?: string
          id?: string
          mom_approved?: boolean | null
          mom_reprove_comment?: string | null
          photo_proof_url?: string | null
          points?: number
          proof_required?: boolean
          rescued_by_mom?: boolean
          title?: string
          updated_at?: string
          urgency?: string
        }
        Relationships: []
      }
      whatsapp_message_log: {
        Row: {
          id: string
          message_content: string | null
          message_type: string
          sent_at: string
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          message_content?: string | null
          message_type: string
          sent_at?: string
          status?: string
          user_id: string
        }
        Update: {
          id?: string
          message_content?: string | null
          message_type?: string
          sent_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_subscriptions: {
        Row: {
          active: boolean
          created_at: string
          id: string
          otp_code: string | null
          otp_expires_at: string | null
          paused_until: string | null
          phone_number: string
          preferences: Json
          preferred_time: string
          updated_at: string
          user_id: string
          verified: boolean
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          otp_code?: string | null
          otp_expires_at?: string | null
          paused_until?: string | null
          phone_number: string
          preferences?: Json
          preferred_time?: string
          updated_at?: string
          user_id: string
          verified?: boolean
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          otp_code?: string | null
          otp_expires_at?: string | null
          paused_until?: string | null
          phone_number?: string
          preferences?: Json
          preferred_time?: string
          updated_at?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      ranking_view: {
        Row: {
          avatar_url: string | null
          display_name: string | null
          id: string | null
          points: number | null
          role: string | null
          streak_days: number | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          display_name?: string | null
          id?: string | null
          points?: number | null
          role?: string | null
          streak_days?: number | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          display_name?: string | null
          id?: string | null
          points?: number | null
          role?: string | null
          streak_days?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_current_user_family_id: { Args: never; Returns: string }
      get_ranking_profiles: {
        Args: never
        Returns: {
          avatar_url: string
          display_name: string
          id: string
          points: number
          role: string
          streak_days: number
          user_id: string
        }[]
      }
      get_user_family_id: { Args: { _user_id: string }; Returns: string }
      join_family_by_code: { Args: { invite_code: string }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
