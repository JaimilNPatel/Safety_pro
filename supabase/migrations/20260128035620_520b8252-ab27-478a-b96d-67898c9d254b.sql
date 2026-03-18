-- Drop existing inspection_equipment table to recreate with enhanced schema
DROP TABLE IF EXISTS public.inspection_equipment;

-- Create enhanced inspection_equipment table with NFPA 70B-style assessment
CREATE TABLE public.inspection_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  equipment_type TEXT NOT NULL,
  
  -- Safety Limits
  design_pressure_psi NUMERIC,
  max_operating_pressure_psi NUMERIC,
  design_temperature_c NUMERIC,
  max_operating_temperature_c NUMERIC,
  safety_relief_setpoint_psi NUMERIC,
  
  -- Usage Metrics
  current_operating_pressure_psi NUMERIC,
  current_operating_temperature_c NUMERIC,
  capacity_utilization_percent NUMERIC DEFAULT 0 CHECK (capacity_utilization_percent >= 0 AND capacity_utilization_percent <= 100),
  operating_hours_per_day NUMERIC DEFAULT 8 CHECK (operating_hours_per_day >= 0 AND operating_hours_per_day <= 24),
  years_in_service NUMERIC DEFAULT 0,
  
  -- Maintenance Data
  last_maintenance_date DATE,
  maintenance_frequency_days INTEGER DEFAULT 90,
  last_inspection_date DATE,
  inspection_frequency_days INTEGER DEFAULT 365,
  maintenance_compliance_percent NUMERIC DEFAULT 100,
  outstanding_work_orders INTEGER DEFAULT 0,
  
  -- Physical Condition Assessment (NFPA 70B style: 1=best, 3=worst)
  physical_condition INTEGER DEFAULT 1 CHECK (physical_condition BETWEEN 1 AND 3),
  has_visible_damage BOOLEAN DEFAULT false,
  has_corrosion BOOLEAN DEFAULT false,
  has_leaks BOOLEAN DEFAULT false,
  
  -- Criticality Assessment
  criticality_level INTEGER DEFAULT 2 CHECK (criticality_level BETWEEN 1 AND 3),
  is_safety_critical BOOLEAN DEFAULT false,
  redundancy_available BOOLEAN DEFAULT false,
  
  -- Environment Assessment
  environment_condition INTEGER DEFAULT 1 CHECK (environment_condition BETWEEN 1 AND 3),
  exposed_to_corrosive BOOLEAN DEFAULT false,
  exposed_to_vibration BOOLEAN DEFAULT false,
  exposed_to_extreme_temp BOOLEAN DEFAULT false,
  
  -- Calculated Overall Condition (auto-populated)
  overall_condition TEXT NOT NULL DEFAULT 'good',
  condition_score NUMERIC DEFAULT 100,
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inspection_equipment ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their inspection equipment
CREATE POLICY "Users can manage their inspection equipment" 
ON public.inspection_equipment 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM inspections 
  WHERE inspections.id = inspection_equipment.inspection_id 
  AND inspections.user_id = auth.uid()
));

-- Create generated_checklist table for dynamic checklists
CREATE TABLE public.generated_checklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  source_type TEXT NOT NULL, -- 'site', 'chemical', 'equipment', 'general'
  source_reference TEXT, -- ID or name of the source
  checked BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generated_checklist ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their generated checklists
CREATE POLICY "Users can manage their generated checklists" 
ON public.generated_checklist 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM inspections 
  WHERE inspections.id = generated_checklist.inspection_id 
  AND inspections.user_id = auth.uid()
));