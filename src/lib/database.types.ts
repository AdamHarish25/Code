/**
 * Supabase Database Types
 * Auto-generated types from database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Enums
export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'expired';
export type InputMethod = 'manual' | 'photo' | 'upload';
export type InvestmentPath = 'conservative' | 'active-compounder';
export type GoalPriority = 'low' | 'medium' | 'high';
export type ImpactIndicator = 'low' | 'medium' | 'high';
export type NotificationType = 'success' | 'warning' | 'error' | 'info';
export type InsightType = 'advice' | 'alert' | 'opportunity' | 'achievement';

// Database schema types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          investment_path: InvestmentPath | null;
          currency: string | null;
          timezone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          investment_path?: InvestmentPath | null;
          currency?: string | null;
          timezone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          investment_path?: InvestmentPath | null;
          currency?: string | null;
          timezone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      income_sources: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          amount: number;
          frequency: string;
          type: string;
          is_active: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          amount: number;
          frequency: string;
          type: string;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          amount?: number;
          frequency?: string;
          type?: string;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      category_allocations: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string;
          allocated_amount: number;
          spent_amount: number;
          is_essential: boolean | null;
          impact_indicator: ImpactIndicator | null;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category: string;
          allocated_amount?: number;
          spent_amount?: number;
          is_essential?: boolean | null;
          impact_indicator?: ImpactIndicator | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          category?: string;
          allocated_amount?: number;
          spent_amount?: number;
          is_essential?: boolean | null;
          impact_indicator?: ImpactIndicator | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      financial_goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          target_amount: number;
          current_amount: number;
          target_date: string | null;
          priority: GoalPriority | null;
          icon: string | null;
          is_completed: boolean | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          target_amount: number;
          current_amount?: number;
          target_date?: string | null;
          priority?: GoalPriority | null;
          icon?: string | null;
          is_completed?: boolean | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          target_amount?: number;
          current_amount?: number;
          target_date?: string | null;
          priority?: GoalPriority | null;
          icon?: string | null;
          is_completed?: boolean | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: TransactionType;
          category: string;
          account: string;
          amount: number;
          merchant: string | null;
          date: string;
          note: string | null;
          attachment_url: string | null;
          input_method: InputMethod | null;
          status: TransactionStatus | null;
          paylabs_transaction_id: string | null;
          paylabs_gateway_id: string | null;
          paylabs_response: Json | null;
          ai_category: string | null;
          ai_confidence: number | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: TransactionType;
          category: string;
          account: string;
          amount: number;
          merchant?: string | null;
          date: string;
          note?: string | null;
          attachment_url?: string | null;
          input_method?: InputMethod | null;
          status?: TransactionStatus | null;
          paylabs_transaction_id?: string | null;
          paylabs_gateway_id?: string | null;
          paylabs_response?: Json | null;
          ai_category?: string | null;
          ai_confidence?: number | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: TransactionType;
          category?: string;
          account?: string;
          amount?: number;
          merchant?: string | null;
          date?: string;
          note?: string | null;
          attachment_url?: string | null;
          input_method?: InputMethod | null;
          status?: TransactionStatus | null;
          paylabs_transaction_id?: string | null;
          paylabs_gateway_id?: string | null;
          paylabs_response?: Json | null;
          ai_category?: string | null;
          ai_confidence?: number | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      budget_insights: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          type: InsightType;
          is_read: boolean | null;
          read_at: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          type: InsightType;
          is_read?: boolean | null;
          read_at?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          type?: InsightType;
          is_read?: boolean | null;
          read_at?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          message: string;
          is_read: boolean | null;
          read_at: string | null;
          action_url: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: NotificationType;
          title: string;
          message: string;
          is_read?: boolean | null;
          read_at?: string | null;
          action_url?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: NotificationType;
          title?: string;
          message?: string;
          is_read?: boolean | null;
          read_at?: string | null;
          action_url?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      paylabs_webhooks: {
        Row: {
          id: string;
          event_id: string;
          event_type: string;
          merchant_id: string;
          transaction_id: string | null;
          remit_id: string | null;
          amount: number;
          currency: string | null;
          status: string;
          payload: Json;
          signature: string | null;
          processed: boolean | null;
          processed_at: string | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          event_type: string;
          merchant_id: string;
          transaction_id?: string | null;
          remit_id?: string | null;
          amount: number;
          currency?: string | null;
          status: string;
          payload: Json;
          signature?: string | null;
          processed?: boolean | null;
          processed_at?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          event_type?: string;
          merchant_id?: string;
          transaction_id?: string | null;
          remit_id?: string | null;
          amount?: number;
          currency?: string | null;
          status?: string;
          payload?: Json;
          signature?: string | null;
          processed?: boolean | null;
          processed_at?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
      };
      ocr_receipts: {
        Row: {
          id: string;
          user_id: string;
          image_url: string;
          merchant: string | null;
          date: string | null;
          amount: number | null;
          confidence: number | null;
          raw_text: string | null;
          transaction_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          image_url: string;
          merchant?: string | null;
          date?: string | null;
          amount?: number | null;
          confidence?: number | null;
          raw_text?: string | null;
          transaction_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          image_url?: string;
          merchant?: string | null;
          date?: string | null;
          amount?: number | null;
          confidence?: number | null;
          raw_text?: string | null;
          transaction_id?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {
      get_monthly_income: {
        Args: {
          p_user_id: string;
        };
        Returns: number;
      };
      get_allocation_status: {
        Args: {
          p_user_id: string;
        };
        Returns: Json;
      };
    };
  };
}

// Type helpers for database operations
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type IncomeSource = Database['public']['Tables']['income_sources']['Row'];
export type IncomeSourceInsert = Database['public']['Tables']['income_sources']['Insert'];
export type IncomeSourceUpdate = Database['public']['Tables']['income_sources']['Update'];

export type CategoryAllocation = Database['public']['Tables']['category_allocations']['Row'];
export type CategoryAllocationInsert = Database['public']['Tables']['category_allocations']['Insert'];
export type CategoryAllocationUpdate = Database['public']['Tables']['category_allocations']['Update'];

export type FinancialGoal = Database['public']['Tables']['financial_goals']['Row'];
export type FinancialGoalInsert = Database['public']['Tables']['financial_goals']['Insert'];
export type FinancialGoalUpdate = Database['public']['Tables']['financial_goals']['Update'];

export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

export type BudgetInsight = Database['public']['Tables']['budget_insights']['Row'];
export type BudgetInsightInsert = Database['public']['Tables']['budget_insights']['Insert'];
export type BudgetInsightUpdate = Database['public']['Tables']['budget_insights']['Update'];

export type Notification = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];

export type PaylabsWebhook = Database['public']['Tables']['paylabs_webhooks']['Row'];
export type PaylabsWebhookInsert = Database['public']['Tables']['paylabs_webhooks']['Insert'];

export type OCRReceipt = Database['public']['Tables']['ocr_receipts']['Row'];
export type OCRReceiptInsert = Database['public']['Tables']['ocr_receipts']['Insert'];
export type OCRReceiptUpdate = Database['public']['Tables']['ocr_receipts']['Update'];
