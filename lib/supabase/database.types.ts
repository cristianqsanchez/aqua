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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          account_name: string
          account_number: string
          account_owner_id: string | null
          account_type: string | null
          annual_revenue: number | null
          billing_address: string | null
          billing_city: string | null
          billing_country_code: string | null
          billing_postal_code: string | null
          billing_state: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          employee_count: number | null
          id: string
          industry: string | null
          notes: string | null
          parent_account_id: string | null
          phone: string | null
          relationship_status: string | null
          shipping_address: string | null
          shipping_city: string | null
          shipping_country_code: string | null
          shipping_postal_code: string | null
          shipping_state: string | null
          tags: string[] | null
          tax_id: string | null
          tenant_id: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          account_name: string
          account_number: string
          account_owner_id?: string | null
          account_type?: string | null
          annual_revenue?: number | null
          billing_address?: string | null
          billing_city?: string | null
          billing_country_code?: string | null
          billing_postal_code?: string | null
          billing_state?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          employee_count?: number | null
          id?: string
          industry?: string | null
          notes?: string | null
          parent_account_id?: string | null
          phone?: string | null
          relationship_status?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_country_code?: string | null
          shipping_postal_code?: string | null
          shipping_state?: string | null
          tags?: string[] | null
          tax_id?: string | null
          tenant_id: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string
          account_owner_id?: string | null
          account_type?: string | null
          annual_revenue?: number | null
          billing_address?: string | null
          billing_city?: string | null
          billing_country_code?: string | null
          billing_postal_code?: string | null
          billing_state?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          employee_count?: number | null
          id?: string
          industry?: string | null
          notes?: string | null
          parent_account_id?: string | null
          phone?: string | null
          relationship_status?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_country_code?: string | null
          shipping_postal_code?: string | null
          shipping_state?: string | null
          tags?: string[] | null
          tax_id?: string | null
          tenant_id?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_account_owner_id_fkey"
            columns: ["account_owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          city: string | null
          code: string
          country_code: string | null
          created_at: string | null
          currency_code: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_headquarters: boolean | null
          name: string
          phone: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          code: string
          country_code?: string | null
          created_at?: string | null
          currency_code?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_headquarters?: boolean | null
          name: string
          phone?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          code?: string
          country_code?: string | null
          created_at?: string | null
          currency_code?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_headquarters?: boolean | null
          name?: string
          phone?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_contacts: {
        Row: {
          created_at: string | null
          customer_id: string
          email: string | null
          first_name: string
          id: string
          is_primary: boolean | null
          last_name: string
          mobile: string | null
          notes: string | null
          phone: string | null
          tenant_id: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          email?: string | null
          first_name: string
          id?: string
          is_primary?: boolean | null
          last_name: string
          mobile?: string | null
          notes?: string | null
          phone?: string | null
          tenant_id: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          email?: string | null
          first_name?: string
          id?: string
          is_primary?: boolean | null
          last_name?: string
          mobile?: string | null
          notes?: string | null
          phone?: string | null
          tenant_id?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_contacts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          assigned_to: string | null
          city: string | null
          company_name: string | null
          contact_name: string | null
          country_code: string | null
          created_at: string | null
          created_by: string | null
          customer_type: string
          email: string | null
          first_name: string | null
          id: string
          industry: string | null
          last_name: string | null
          mobile: string | null
          notes: string | null
          phone: string | null
          postal_code: string | null
          state: string | null
          status: string | null
          tags: string[] | null
          tax_id: string | null
          tenant_id: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          assigned_to?: string | null
          city?: string | null
          company_name?: string | null
          contact_name?: string | null
          country_code?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_type: string
          email?: string | null
          first_name?: string | null
          id?: string
          industry?: string | null
          last_name?: string | null
          mobile?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          status?: string | null
          tags?: string[] | null
          tax_id?: string | null
          tenant_id: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          assigned_to?: string | null
          city?: string | null
          company_name?: string | null
          contact_name?: string | null
          country_code?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_type?: string
          email?: string | null
          first_name?: string | null
          id?: string
          industry?: string | null
          last_name?: string | null
          mobile?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          status?: string | null
          tags?: string[] | null
          tax_id?: string | null
          tenant_id?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          balance_due: number | null
          branch_id: string | null
          created_at: string | null
          created_by: string | null
          currency_code: string | null
          customer_id: string
          description: string | null
          discount_amount: number | null
          due_date: string | null
          id: string
          invoice_date: string | null
          invoice_number: string
          invoice_type: string | null
          notes: string | null
          order_id: string | null
          paid_amount: number | null
          paid_date: string | null
          payment_status: string | null
          payment_terms: string | null
          project_id: string | null
          sent_at: string | null
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          tenant_id: string
          total: number | null
          updated_at: string | null
        }
        Insert: {
          balance_due?: number | null
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency_code?: string | null
          customer_id: string
          description?: string | null
          discount_amount?: number | null
          due_date?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number: string
          invoice_type?: string | null
          notes?: string | null
          order_id?: string | null
          paid_amount?: number | null
          paid_date?: string | null
          payment_status?: string | null
          payment_terms?: string | null
          project_id?: string | null
          sent_at?: string | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tenant_id: string
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          balance_due?: number | null
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency_code?: string | null
          customer_id?: string
          description?: string | null
          discount_amount?: number | null
          due_date?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string
          invoice_type?: string | null
          notes?: string | null
          order_id?: string | null
          paid_amount?: number | null
          paid_date?: string | null
          payment_status?: string | null
          payment_terms?: string | null
          project_id?: string | null
          sent_at?: string | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tenant_id?: string
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      kv_store_c765fa07: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
      }
      leads: {
        Row: {
          address: string | null
          assigned_to: string | null
          city: string | null
          company_name: string | null
          contact_name: string | null
          converted_at: string | null
          converted_to_customer_id: string | null
          country_code: string | null
          created_at: string | null
          created_by: string | null
          customer_type: string
          email: string | null
          estimated_close_date: string | null
          estimated_value: number | null
          first_name: string | null
          id: string
          industry: string | null
          interest: string | null
          last_contact_date: string | null
          last_name: string | null
          lead_number: string
          mobile: string | null
          next_follow_up_date: string | null
          notes: string | null
          phone: string | null
          postal_code: string | null
          priority: string | null
          source: string | null
          state: string | null
          status: string | null
          tags: string[] | null
          tenant_id: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          assigned_to?: string | null
          city?: string | null
          company_name?: string | null
          contact_name?: string | null
          converted_at?: string | null
          converted_to_customer_id?: string | null
          country_code?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_type: string
          email?: string | null
          estimated_close_date?: string | null
          estimated_value?: number | null
          first_name?: string | null
          id?: string
          industry?: string | null
          interest?: string | null
          last_contact_date?: string | null
          last_name?: string | null
          lead_number: string
          mobile?: string | null
          next_follow_up_date?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          priority?: string | null
          source?: string | null
          state?: string | null
          status?: string | null
          tags?: string[] | null
          tenant_id: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          assigned_to?: string | null
          city?: string | null
          company_name?: string | null
          contact_name?: string | null
          converted_at?: string | null
          converted_to_customer_id?: string | null
          country_code?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_type?: string
          email?: string | null
          estimated_close_date?: string | null
          estimated_value?: number | null
          first_name?: string | null
          id?: string
          industry?: string | null
          interest?: string | null
          last_contact_date?: string | null
          last_name?: string | null
          lead_number?: string
          mobile?: string | null
          next_follow_up_date?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          priority?: string | null
          source?: string | null
          state?: string | null
          status?: string | null
          tags?: string[] | null
          tenant_id?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_contracts: {
        Row: {
          annual_fee: number | null
          contract_number: string
          contract_type: string | null
          created_at: string | null
          currency_code: string | null
          customer_id: string
          description: string | null
          end_date: string
          id: string
          monthly_fee: number | null
          service_frequency: string | null
          start_date: string
          status: string | null
          tenant_id: string
          terms: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          annual_fee?: number | null
          contract_number: string
          contract_type?: string | null
          created_at?: string | null
          currency_code?: string | null
          customer_id: string
          description?: string | null
          end_date: string
          id?: string
          monthly_fee?: number | null
          service_frequency?: string | null
          start_date: string
          status?: string | null
          tenant_id: string
          terms?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          annual_fee?: number | null
          contract_number?: string
          contract_type?: string | null
          created_at?: string | null
          currency_code?: string | null
          customer_id?: string
          description?: string | null
          end_date?: string
          id?: string
          monthly_fee?: number | null
          service_frequency?: string | null
          start_date?: string
          status?: string | null
          tenant_id?: string
          terms?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_contracts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_contracts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          account_id: string | null
          actual_close_date: string | null
          amount: number | null
          competitors: string | null
          created_at: string | null
          created_by: string | null
          currency_code: string | null
          description: string | null
          expected_close_date: string | null
          expected_revenue: number | null
          id: string
          lead_id: string | null
          loss_description: string | null
          loss_reason: string | null
          next_step: string | null
          notes: string | null
          opportunity_name: string
          opportunity_number: string
          opportunity_type: string | null
          owner_id: string | null
          probability: number | null
          stage: string | null
          tags: string[] | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          actual_close_date?: string | null
          amount?: number | null
          competitors?: string | null
          created_at?: string | null
          created_by?: string | null
          currency_code?: string | null
          description?: string | null
          expected_close_date?: string | null
          expected_revenue?: number | null
          id?: string
          lead_id?: string | null
          loss_description?: string | null
          loss_reason?: string | null
          next_step?: string | null
          notes?: string | null
          opportunity_name: string
          opportunity_number: string
          opportunity_type?: string | null
          owner_id?: string | null
          probability?: number | null
          stage?: string | null
          tags?: string[] | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          actual_close_date?: string | null
          amount?: number | null
          competitors?: string | null
          created_at?: string | null
          created_by?: string | null
          currency_code?: string | null
          description?: string | null
          expected_close_date?: string | null
          expected_revenue?: number | null
          id?: string
          lead_id?: string | null
          loss_description?: string | null
          loss_reason?: string | null
          next_step?: string | null
          notes?: string | null
          opportunity_name?: string
          opportunity_number?: string
          opportunity_type?: string | null
          owner_id?: string | null
          probability?: number | null
          stage?: string | null
          tags?: string[] | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          assigned_to: string | null
          branch_id: string | null
          created_at: string | null
          created_by: string | null
          currency_code: string | null
          customer_id: string
          description: string | null
          discount_amount: number | null
          expected_delivery_date: string | null
          id: string
          order_date: string | null
          order_number: string
          priority: string | null
          quote_id: string | null
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          tenant_id: string
          title: string
          total: number | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency_code?: string | null
          customer_id: string
          description?: string | null
          discount_amount?: number | null
          expected_delivery_date?: string | null
          id?: string
          order_date?: string | null
          order_number: string
          priority?: string | null
          quote_id?: string | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tenant_id: string
          title: string
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency_code?: string | null
          customer_id?: string
          description?: string | null
          discount_amount?: number | null
          expected_delivery_date?: string | null
          id?: string
          order_date?: string | null
          order_number?: string
          priority?: string | null
          quote_id?: string | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tenant_id?: string
          title?: string
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rates: {
        Row: {
          assembly_pouring: number | null
          assistance: number | null
          concrete: number | null
          created_at: string | null
          currency: string | null
          discharge: number | null
          double_fond: number | null
          double_fond_install: number | null
          earth_evacuation: number | null
          earthwork: number | null
          earthwork_filling: number | null
          electrical_connections: number | null
          filtration_install: number | null
          id: string
          is_active: boolean | null
          kit_price: number | null
          liner_install: number | null
          model: string | null
          name: string
          pool_masonry: number | null
          pool_type: string | null
          pump: number | null
          size: string | null
          stair_install: number | null
          stair_type: string | null
          support_plots: number | null
          tenant_id: string
          transport: number | null
          updated_at: string | null
        }
        Insert: {
          assembly_pouring?: number | null
          assistance?: number | null
          concrete?: number | null
          created_at?: string | null
          currency?: string | null
          discharge?: number | null
          double_fond?: number | null
          double_fond_install?: number | null
          earth_evacuation?: number | null
          earthwork?: number | null
          earthwork_filling?: number | null
          electrical_connections?: number | null
          filtration_install?: number | null
          id?: string
          is_active?: boolean | null
          kit_price?: number | null
          liner_install?: number | null
          model?: string | null
          name: string
          pool_masonry?: number | null
          pool_type?: string | null
          pump?: number | null
          size?: string | null
          stair_install?: number | null
          stair_type?: string | null
          support_plots?: number | null
          tenant_id: string
          transport?: number | null
          updated_at?: string | null
        }
        Update: {
          assembly_pouring?: number | null
          assistance?: number | null
          concrete?: number | null
          created_at?: string | null
          currency?: string | null
          discharge?: number | null
          double_fond?: number | null
          double_fond_install?: number | null
          earth_evacuation?: number | null
          earthwork?: number | null
          earthwork_filling?: number | null
          electrical_connections?: number | null
          filtration_install?: number | null
          id?: string
          is_active?: boolean | null
          kit_price?: number | null
          liner_install?: number | null
          model?: string | null
          name?: string
          pool_masonry?: number | null
          pool_type?: string | null
          pump?: number | null
          size?: string | null
          stair_install?: number | null
          stair_type?: string | null
          support_plots?: number | null
          tenant_id?: string
          transport?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_rates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          category_code: string | null
          category_name: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          parent_category_id: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          category_code?: string | null
          category_name: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          parent_category_id?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          category_code?: string | null
          category_name?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          parent_category_id?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          cost_price: number | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          min_stock_level: number | null
          product_code: string
          product_name: string
          product_type: string
          stock_quantity: number | null
          tax_rate: number | null
          tenant_id: string
          unit_of_measure: string | null
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          min_stock_level?: number | null
          product_code: string
          product_name: string
          product_type: string
          stock_quantity?: number | null
          tax_rate?: number | null
          tenant_id: string
          unit_of_measure?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          min_stock_level?: number | null
          product_code?: string
          product_name?: string
          product_type?: string
          stock_quantity?: number | null
          tax_rate?: number | null
          tenant_id?: string
          unit_of_measure?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          completed_date: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          parent_task_id: string | null
          priority: string | null
          project_id: string
          sort_order: number | null
          start_date: string | null
          status: string | null
          task_name: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          parent_task_id?: string | null
          priority?: string | null
          project_id: string
          sort_order?: number | null
          start_date?: string | null
          status?: string | null
          task_name: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          parent_task_id?: string | null
          priority?: string | null
          project_id?: string
          sort_order?: number | null
          start_date?: string | null
          status?: string | null
          task_name?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      project_work_calendar: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_time: string | null
          event_date: string
          event_type: string | null
          id: string
          notes: string | null
          project_id: string
          start_time: string | null
          status: string | null
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_date: string
          event_type?: string | null
          id?: string
          notes?: string | null
          project_id: string
          start_time?: string | null
          status?: string | null
          tenant_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_date?: string
          event_type?: string | null
          id?: string
          notes?: string | null
          project_id?: string
          start_time?: string | null
          status?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_work_calendar_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_work_calendar_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_work_calendar_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_work_calendar_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          actual_cost: number | null
          actual_end_date: string | null
          branch_id: string | null
          budget: number | null
          created_at: string | null
          created_by: string | null
          currency_code: string | null
          customer_id: string
          description: string | null
          id: string
          name: string
          order_id: string | null
          planned_end_date: string | null
          pool_type: string | null
          progress_percent: number | null
          project_manager_id: string | null
          project_number: string
          project_type: string | null
          site_address: string | null
          site_city: string | null
          site_country_code: string | null
          site_state: string | null
          start_date: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          actual_end_date?: string | null
          branch_id?: string | null
          budget?: number | null
          created_at?: string | null
          created_by?: string | null
          currency_code?: string | null
          customer_id: string
          description?: string | null
          id?: string
          name: string
          order_id?: string | null
          planned_end_date?: string | null
          pool_type?: string | null
          progress_percent?: number | null
          project_manager_id?: string | null
          project_number: string
          project_type?: string | null
          site_address?: string | null
          site_city?: string | null
          site_country_code?: string | null
          site_state?: string | null
          start_date?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          actual_end_date?: string | null
          branch_id?: string | null
          budget?: number | null
          created_at?: string | null
          created_by?: string | null
          currency_code?: string | null
          customer_id?: string
          description?: string | null
          id?: string
          name?: string
          order_id?: string | null
          planned_end_date?: string | null
          pool_type?: string | null
          progress_percent?: number | null
          project_manager_id?: string | null
          project_number?: string
          project_type?: string | null
          site_address?: string | null
          site_city?: string | null
          site_country_code?: string | null
          site_state?: string | null
          start_date?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_project_manager_id_fkey"
            columns: ["project_manager_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          created_at: string | null
          description: string
          discount_percent: number | null
          id: string
          item_type: string
          line_total: number | null
          product_id: string | null
          quantity: number
          quote_id: string
          sort_order: number | null
          tax_rate: number | null
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          discount_percent?: number | null
          id?: string
          item_type: string
          line_total?: number | null
          product_id?: string | null
          quantity?: number
          quote_id: string
          sort_order?: number | null
          tax_rate?: number | null
          unit_price?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          discount_percent?: number | null
          id?: string
          item_type?: string
          line_total?: number | null
          product_id?: string | null
          quantity?: number
          quote_id?: string
          sort_order?: number | null
          tax_rate?: number | null
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          branch_id: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string
          discount_amount: number | null
          id: string
          notes: string | null
          opportunity_id: string | null
          quote_date: string | null
          quote_number: string
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          tenant_id: string
          terms_and_conditions: string | null
          total_amount: number | null
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          discount_amount?: number | null
          id?: string
          notes?: string | null
          opportunity_id?: string | null
          quote_date?: string | null
          quote_number: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tenant_id: string
          terms_and_conditions?: string | null
          total_amount?: number | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          discount_amount?: number | null
          id?: string
          notes?: string | null
          opportunity_id?: string | null
          quote_date?: string | null
          quote_number?: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tenant_id?: string
          terms_and_conditions?: string | null
          total_amount?: number | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          country_code: string | null
          created_at: string | null
          default_currency: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          primary_color: string | null
          slug: string
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          country_code?: string | null
          created_at?: string | null
          default_currency?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          primary_color?: string | null
          slug: string
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          country_code?: string | null
          created_at?: string | null
          default_currency?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          slug?: string
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string
          description: string | null
          id: string
          priority: string | null
          project_id: string | null
          resolution: string | null
          resolved_at: string | null
          status: string | null
          subject: string
          tenant_id: string
          ticket_number: string
          ticket_type: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          description?: string | null
          id?: string
          priority?: string | null
          project_id?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: string | null
          subject: string
          tenant_id: string
          ticket_number: string
          ticket_type?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          description?: string | null
          id?: string
          priority?: string | null
          project_id?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: string | null
          subject?: string
          tenant_id?: string
          ticket_number?: string
          ticket_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          branch_id: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          tenant_id: string
          updated_at: string | null
          user_role: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          tenant_id: string
          updated_at?: string | null
          user_role?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          tenant_id?: string
          updated_at?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      warranties: {
        Row: {
          coverage_details: string | null
          created_at: string | null
          customer_id: string
          description: string | null
          end_date: string
          id: string
          project_id: string | null
          start_date: string
          status: string | null
          tenant_id: string
          title: string
          updated_at: string | null
          warranty_number: string
        }
        Insert: {
          coverage_details?: string | null
          created_at?: string | null
          customer_id: string
          description?: string | null
          end_date: string
          id?: string
          project_id?: string | null
          start_date: string
          status?: string | null
          tenant_id: string
          title: string
          updated_at?: string | null
          warranty_number: string
        }
        Update: {
          coverage_details?: string | null
          created_at?: string | null
          customer_id?: string
          description?: string | null
          end_date?: string
          id?: string
          project_id?: string | null
          start_date?: string
          status?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
          warranty_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "warranties_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranties_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranties_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_project_profitability: {
        Args: { p_project_id: string }
        Returns: {
          costs: number
          invoiced: number
          margin: number
        }[]
      }
      create_ledger_entry_fx: {
        Args: {
          p_amount: number
          p_base_currency: string
          p_currency: string
          p_rate: number
          p_reference_id: string
          p_reference_type: string
          p_tenant_id: string
        }
        Returns: undefined
      }
      create_project_from_contract: {
        Args: { p_contract_id: string }
        Returns: string
      }
      current_tenant_id: { Args: never; Returns: string }
      generate_accounting_snapshot: {
        Args: { p_currency: string; p_date: string; p_tenant_id: string }
        Returns: undefined
      }
      generate_initial_invoice: {
        Args: { p_due_days?: number; p_project_id: string }
        Returns: string
      }
      get_available_stock: {
        Args: { p_branch_id: string; p_item_id: string }
        Returns: number
      }
      invoice_milestone: { Args: { p_milestone_id: string }; Returns: string }
      mark_overdue_invoices: { Args: never; Returns: undefined }
      reconcile_bank_transaction: {
        Args: { p_bank_transaction_id: string; p_invoice_id: string }
        Returns: undefined
      }
      register_payment: {
        Args: { p_amount: number; p_invoice_id: string; p_paid_at?: string }
        Returns: undefined
      }
      release_stock: {
        Args: {
          p_branch_id: string
          p_item_id: string
          p_project_id: string
          p_quantity: number
        }
        Returns: undefined
      }
      reserve_stock: {
        Args: {
          p_branch_id: string
          p_item_id: string
          p_project_id: string
          p_quantity: number
        }
        Returns: undefined
      }
      validate_status_transition: {
        Args: {
          p_domain: string
          p_entity: string
          p_from: string
          p_to: string
        }
        Returns: boolean
      }
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
