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
      chemicals: {
        Row: {
          auto_ignition_temp_c: number | null
          boiling_point: number | null
          cas_number: string
          created_at: string
          density_kg_m3: number | null
          flash_point: number | null
          heat_of_combustion: number | null
          id: string
          idlh_ppm: number | null
          log_kow: number | null
          lower_explosive_limit: number | null
          material_factor: number | null
          molecular_weight: number | null
          name: string
          nfpa_fire: number | null
          nfpa_health: number | null
          nfpa_reactivity: number | null
          reactivity_group: string
          specific_heat_kj_kgk: number | null
          upper_explosive_limit: number | null
          vapor_density: number | null
          vapor_pressure_kpa: number | null
          viscosity_cp: number | null
        }
        Insert: {
          auto_ignition_temp_c?: number | null
          boiling_point?: number | null
          cas_number: string
          created_at?: string
          density_kg_m3?: number | null
          flash_point?: number | null
          heat_of_combustion?: number | null
          id?: string
          idlh_ppm?: number | null
          log_kow?: number | null
          lower_explosive_limit?: number | null
          material_factor?: number | null
          molecular_weight?: number | null
          name: string
          nfpa_fire?: number | null
          nfpa_health?: number | null
          nfpa_reactivity?: number | null
          reactivity_group: string
          specific_heat_kj_kgk?: number | null
          upper_explosive_limit?: number | null
          vapor_density?: number | null
          vapor_pressure_kpa?: number | null
          viscosity_cp?: number | null
        }
        Update: {
          auto_ignition_temp_c?: number | null
          boiling_point?: number | null
          cas_number?: string
          created_at?: string
          density_kg_m3?: number | null
          flash_point?: number | null
          heat_of_combustion?: number | null
          id?: string
          idlh_ppm?: number | null
          log_kow?: number | null
          lower_explosive_limit?: number | null
          material_factor?: number | null
          molecular_weight?: number | null
          name?: string
          nfpa_fire?: number | null
          nfpa_health?: number | null
          nfpa_reactivity?: number | null
          reactivity_group?: string
          specific_heat_kj_kgk?: number | null
          upper_explosive_limit?: number | null
          vapor_density?: number | null
          vapor_pressure_kpa?: number | null
          viscosity_cp?: number | null
        }
        Relationships: []
      }
      generated_checklist: {
        Row: {
          category: string
          checked: boolean
          created_at: string
          id: string
          inspection_id: string
          item: string
          notes: string | null
          priority: string
          source_reference: string | null
          source_type: string
        }
        Insert: {
          category: string
          checked?: boolean
          created_at?: string
          id?: string
          inspection_id: string
          item: string
          notes?: string | null
          priority?: string
          source_reference?: string | null
          source_type: string
        }
        Update: {
          category?: string
          checked?: boolean
          created_at?: string
          id?: string
          inspection_id?: string
          item?: string
          notes?: string | null
          priority?: string
          source_reference?: string | null
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_checklist_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_chemicals: {
        Row: {
          chemical_id: string
          created_at: string
          id: string
          inspection_id: string
          pressure_atm: number
          quantity_kg: number
          storage_temp_c: number
        }
        Insert: {
          chemical_id: string
          created_at?: string
          id?: string
          inspection_id: string
          pressure_atm?: number
          quantity_kg: number
          storage_temp_c?: number
        }
        Update: {
          chemical_id?: string
          created_at?: string
          id?: string
          inspection_id?: string
          pressure_atm?: number
          quantity_kg?: number
          storage_temp_c?: number
        }
        Relationships: [
          {
            foreignKeyName: "inspection_chemicals_chemical_id_fkey"
            columns: ["chemical_id"]
            isOneToOne: false
            referencedRelation: "chemicals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_chemicals_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_equipment: {
        Row: {
          capacity_utilization_percent: number | null
          condition_score: number | null
          created_at: string
          criticality_level: number | null
          current_operating_pressure_psi: number | null
          current_operating_temperature_c: number | null
          design_pressure_psi: number | null
          design_temperature_c: number | null
          environment_condition: number | null
          equipment_type: string
          exposed_to_corrosive: boolean | null
          exposed_to_extreme_temp: boolean | null
          exposed_to_vibration: boolean | null
          has_corrosion: boolean | null
          has_leaks: boolean | null
          has_visible_damage: boolean | null
          id: string
          inspection_frequency_days: number | null
          inspection_id: string
          is_safety_critical: boolean | null
          last_inspection_date: string | null
          last_maintenance_date: string | null
          maintenance_compliance_percent: number | null
          maintenance_frequency_days: number | null
          max_operating_pressure_psi: number | null
          max_operating_temperature_c: number | null
          name: string
          notes: string | null
          operating_hours_per_day: number | null
          outstanding_work_orders: number | null
          overall_condition: string
          physical_condition: number | null
          redundancy_available: boolean | null
          safety_relief_setpoint_psi: number | null
          years_in_service: number | null
        }
        Insert: {
          capacity_utilization_percent?: number | null
          condition_score?: number | null
          created_at?: string
          criticality_level?: number | null
          current_operating_pressure_psi?: number | null
          current_operating_temperature_c?: number | null
          design_pressure_psi?: number | null
          design_temperature_c?: number | null
          environment_condition?: number | null
          equipment_type: string
          exposed_to_corrosive?: boolean | null
          exposed_to_extreme_temp?: boolean | null
          exposed_to_vibration?: boolean | null
          has_corrosion?: boolean | null
          has_leaks?: boolean | null
          has_visible_damage?: boolean | null
          id?: string
          inspection_frequency_days?: number | null
          inspection_id: string
          is_safety_critical?: boolean | null
          last_inspection_date?: string | null
          last_maintenance_date?: string | null
          maintenance_compliance_percent?: number | null
          maintenance_frequency_days?: number | null
          max_operating_pressure_psi?: number | null
          max_operating_temperature_c?: number | null
          name: string
          notes?: string | null
          operating_hours_per_day?: number | null
          outstanding_work_orders?: number | null
          overall_condition?: string
          physical_condition?: number | null
          redundancy_available?: boolean | null
          safety_relief_setpoint_psi?: number | null
          years_in_service?: number | null
        }
        Update: {
          capacity_utilization_percent?: number | null
          condition_score?: number | null
          created_at?: string
          criticality_level?: number | null
          current_operating_pressure_psi?: number | null
          current_operating_temperature_c?: number | null
          design_pressure_psi?: number | null
          design_temperature_c?: number | null
          environment_condition?: number | null
          equipment_type?: string
          exposed_to_corrosive?: boolean | null
          exposed_to_extreme_temp?: boolean | null
          exposed_to_vibration?: boolean | null
          has_corrosion?: boolean | null
          has_leaks?: boolean | null
          has_visible_damage?: boolean | null
          id?: string
          inspection_frequency_days?: number | null
          inspection_id?: string
          is_safety_critical?: boolean | null
          last_inspection_date?: string | null
          last_maintenance_date?: string | null
          maintenance_compliance_percent?: number | null
          maintenance_frequency_days?: number | null
          max_operating_pressure_psi?: number | null
          max_operating_temperature_c?: number | null
          name?: string
          notes?: string | null
          operating_hours_per_day?: number | null
          outstanding_work_orders?: number | null
          overall_condition?: string
          physical_condition?: number | null
          redundancy_available?: boolean | null
          safety_relief_setpoint_psi?: number | null
          years_in_service?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_equipment_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_notes: {
        Row: {
          created_at: string
          id: string
          inspection_id: string
          notes: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          inspection_id: string
          notes?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          inspection_id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_notes_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          inspection_type: string
          site_id: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          inspection_type: string
          site_id: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          inspection_type?: string
          site_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspections_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      risk_findings: {
        Row: {
          created_at: string
          description: string
          finding_type: string
          id: string
          inspection_id: string
          recommendation: string | null
          resolved: boolean
          resolved_at: string | null
          resolved_notes: string | null
          score: number | null
          severity: string
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          finding_type: string
          id?: string
          inspection_id: string
          recommendation?: string | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_notes?: string | null
          score?: number | null
          severity: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          finding_type?: string
          id?: string
          inspection_id?: string
          recommendation?: string | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_notes?: string | null
          score?: number | null
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_findings_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      routine_checklist: {
        Row: {
          category: string
          checked: boolean
          created_at: string
          id: string
          inspection_id: string
          item: string
        }
        Insert: {
          category: string
          checked?: boolean
          created_at?: string
          id?: string
          inspection_id: string
          item: string
        }
        Update: {
          category?: string
          checked?: boolean
          created_at?: string
          id?: string
          inspection_id?: string
          item?: string
        }
        Relationships: [
          {
            foreignKeyName: "routine_checklist_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      site_chemicals: {
        Row: {
          chemical_id: string
          created_at: string
          id: string
          last_updated: string
          pressure_atm: number
          quantity_kg: number
          site_id: string
          storage_location: string | null
          storage_temp_c: number
        }
        Insert: {
          chemical_id: string
          created_at?: string
          id?: string
          last_updated?: string
          pressure_atm?: number
          quantity_kg: number
          site_id: string
          storage_location?: string | null
          storage_temp_c?: number
        }
        Update: {
          chemical_id?: string
          created_at?: string
          id?: string
          last_updated?: string
          pressure_atm?: number
          quantity_kg?: number
          site_id?: string
          storage_location?: string | null
          storage_temp_c?: number
        }
        Relationships: [
          {
            foreignKeyName: "site_chemicals_chemical_id_fkey"
            columns: ["chemical_id"]
            isOneToOne: false
            referencedRelation: "chemicals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_chemicals_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_equipment: {
        Row: {
          capacity_utilization_percent: number | null
          condition_score: number | null
          created_at: string
          criticality_level: number | null
          current_operating_pressure_psi: number | null
          current_operating_temperature_c: number | null
          design_pressure_psi: number | null
          design_temperature_c: number | null
          environment_condition: number | null
          equipment_type: string
          exposed_to_corrosive: boolean | null
          exposed_to_extreme_temp: boolean | null
          exposed_to_vibration: boolean | null
          has_corrosion: boolean | null
          has_leaks: boolean | null
          has_visible_damage: boolean | null
          id: string
          inspection_frequency_days: number | null
          is_safety_critical: boolean | null
          last_inspection_date: string | null
          last_maintenance_date: string | null
          last_updated: string
          maintenance_compliance_percent: number | null
          maintenance_frequency_days: number | null
          max_operating_pressure_psi: number | null
          max_operating_temperature_c: number | null
          name: string
          notes: string | null
          operating_hours_per_day: number | null
          outstanding_work_orders: number | null
          overall_condition: string
          physical_condition: number | null
          redundancy_available: boolean | null
          safety_relief_setpoint_psi: number | null
          site_id: string
          years_in_service: number | null
        }
        Insert: {
          capacity_utilization_percent?: number | null
          condition_score?: number | null
          created_at?: string
          criticality_level?: number | null
          current_operating_pressure_psi?: number | null
          current_operating_temperature_c?: number | null
          design_pressure_psi?: number | null
          design_temperature_c?: number | null
          environment_condition?: number | null
          equipment_type: string
          exposed_to_corrosive?: boolean | null
          exposed_to_extreme_temp?: boolean | null
          exposed_to_vibration?: boolean | null
          has_corrosion?: boolean | null
          has_leaks?: boolean | null
          has_visible_damage?: boolean | null
          id?: string
          inspection_frequency_days?: number | null
          is_safety_critical?: boolean | null
          last_inspection_date?: string | null
          last_maintenance_date?: string | null
          last_updated?: string
          maintenance_compliance_percent?: number | null
          maintenance_frequency_days?: number | null
          max_operating_pressure_psi?: number | null
          max_operating_temperature_c?: number | null
          name: string
          notes?: string | null
          operating_hours_per_day?: number | null
          outstanding_work_orders?: number | null
          overall_condition?: string
          physical_condition?: number | null
          redundancy_available?: boolean | null
          safety_relief_setpoint_psi?: number | null
          site_id: string
          years_in_service?: number | null
        }
        Update: {
          capacity_utilization_percent?: number | null
          condition_score?: number | null
          created_at?: string
          criticality_level?: number | null
          current_operating_pressure_psi?: number | null
          current_operating_temperature_c?: number | null
          design_pressure_psi?: number | null
          design_temperature_c?: number | null
          environment_condition?: number | null
          equipment_type?: string
          exposed_to_corrosive?: boolean | null
          exposed_to_extreme_temp?: boolean | null
          exposed_to_vibration?: boolean | null
          has_corrosion?: boolean | null
          has_leaks?: boolean | null
          has_visible_damage?: boolean | null
          id?: string
          inspection_frequency_days?: number | null
          is_safety_critical?: boolean | null
          last_inspection_date?: string | null
          last_maintenance_date?: string | null
          last_updated?: string
          maintenance_compliance_percent?: number | null
          maintenance_frequency_days?: number | null
          max_operating_pressure_psi?: number | null
          max_operating_temperature_c?: number | null
          name?: string
          notes?: string | null
          operating_hours_per_day?: number | null
          outstanding_work_orders?: number | null
          overall_condition?: string
          physical_condition?: number | null
          redundancy_available?: boolean | null
          safety_relief_setpoint_psi?: number | null
          site_id?: string
          years_in_service?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "site_equipment_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          created_at: string
          id: string
          location: string
          name: string
          site_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location: string
          name: string
          site_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string
          name?: string
          site_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nh3_incidents: {
        Row: {
          id: string
          incident_type: string | null
          equipment: string | null
          failure_mode: string | null
          description: string | null
          immediate_cause: string | null
          root_causes: Json | null
          safeguards_worked: string | null
          safeguards_failed: string | null
          corrective_actions: Json | null
          severity: number | null
          reported_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          incident_type?: string | null
          equipment?: string | null
          failure_mode?: string | null
          description?: string | null
          immediate_cause?: string | null
          root_causes?: Json | null
          safeguards_worked?: string | null
          safeguards_failed?: string | null
          corrective_actions?: Json | null
          severity?: number | null
          reported_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          incident_type?: string | null
          equipment?: string | null
          failure_mode?: string | null
          description?: string | null
          immediate_cause?: string | null
          root_causes?: Json | null
          safeguards_worked?: string | null
          safeguards_failed?: string | null
          corrective_actions?: Json | null
          severity?: number | null
          reported_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      nh3_lopa_scenarios: {
        Row: {
          id: string
          name: string
          equipment_tag: string | null
          initiating_event: string | null
          initiating_freq: number | null
          consequence: string | null
          target_freq: number | null
          selected_layers: Json | null
          mitigated_freq: number | null
          rrf: number | null
          sil_required: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          equipment_tag?: string | null
          initiating_event?: string | null
          initiating_freq?: number | null
          consequence?: string | null
          target_freq?: number | null
          selected_layers?: Json | null
          mitigated_freq?: number | null
          rrf?: number | null
          sil_required?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          equipment_tag?: string | null
          initiating_event?: string | null
          initiating_freq?: number | null
          consequence?: string | null
          target_freq?: number | null
          selected_layers?: Json | null
          mitigated_freq?: number | null
          rrf?: number | null
          sil_required?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      nh3_checklist_results: {
        Row: {
          id: string
          equipment_category: string
          inspector_id: string | null
          inspection_date: string
          items: Json
          critical_failures: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          equipment_category: string
          inspector_id?: string | null
          inspection_date: string
          items: Json
          critical_failures?: number
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          equipment_category?: string
          inspector_id?: string | null
          inspection_date?: string
          items?: Json
          critical_failures?: number
          status?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
