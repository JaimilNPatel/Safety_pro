-- Create site_chemicals table for persistent chemical inventory at site level
CREATE TABLE public.site_chemicals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  chemical_id UUID NOT NULL REFERENCES public.chemicals(id) ON DELETE CASCADE,
  quantity_kg NUMERIC NOT NULL,
  storage_temp_c NUMERIC NOT NULL DEFAULT 25,
  pressure_atm NUMERIC NOT NULL DEFAULT 1,
  storage_location TEXT,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(site_id, chemical_id)
);

-- Create site_equipment table for persistent equipment inventory at site level
CREATE TABLE public.site_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  equipment_type TEXT NOT NULL,
  -- Safety limits
  design_pressure_psi NUMERIC,
  max_operating_pressure_psi NUMERIC,
  current_operating_pressure_psi NUMERIC,
  design_temperature_c NUMERIC,
  max_operating_temperature_c NUMERIC,
  current_operating_temperature_c NUMERIC,
  safety_relief_setpoint_psi NUMERIC,
  -- Usage metrics
  capacity_utilization_percent NUMERIC DEFAULT 0,
  operating_hours_per_day NUMERIC DEFAULT 8,
  years_in_service NUMERIC DEFAULT 0,
  -- Maintenance tracking
  last_maintenance_date DATE,
  maintenance_frequency_days INTEGER DEFAULT 90,
  last_inspection_date DATE,
  inspection_frequency_days INTEGER DEFAULT 365,
  maintenance_compliance_percent NUMERIC DEFAULT 100,
  outstanding_work_orders INTEGER DEFAULT 0,
  -- Condition assessment (NFPA 70B based)
  physical_condition INTEGER DEFAULT 1 CHECK (physical_condition BETWEEN 1 AND 3),
  has_visible_damage BOOLEAN DEFAULT false,
  has_corrosion BOOLEAN DEFAULT false,
  has_leaks BOOLEAN DEFAULT false,
  criticality_level INTEGER DEFAULT 2 CHECK (criticality_level BETWEEN 1 AND 3),
  is_safety_critical BOOLEAN DEFAULT false,
  redundancy_available BOOLEAN DEFAULT false,
  environment_condition INTEGER DEFAULT 1 CHECK (environment_condition BETWEEN 1 AND 3),
  exposed_to_corrosive BOOLEAN DEFAULT false,
  exposed_to_vibration BOOLEAN DEFAULT false,
  exposed_to_extreme_temp BOOLEAN DEFAULT false,
  -- Calculated fields
  condition_score NUMERIC DEFAULT 100,
  overall_condition TEXT NOT NULL DEFAULT 'good',
  notes TEXT,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add resolved tracking to risk_findings
ALTER TABLE public.risk_findings 
ADD COLUMN resolved BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN resolved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN resolved_notes TEXT;

-- Enable RLS on new tables
ALTER TABLE public.site_chemicals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_equipment ENABLE ROW LEVEL SECURITY;

-- RLS policies for site_chemicals
CREATE POLICY "Users can manage their site chemicals"
ON public.site_chemicals
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.sites
  WHERE sites.id = site_chemicals.site_id
  AND sites.user_id = auth.uid()
));

-- RLS policies for site_equipment
CREATE POLICY "Users can manage their site equipment"
ON public.site_equipment
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.sites
  WHERE sites.id = site_equipment.site_id
  AND sites.user_id = auth.uid()
));

-- Create indexes for performance
CREATE INDEX idx_site_chemicals_site_id ON public.site_chemicals(site_id);
CREATE INDEX idx_site_equipment_site_id ON public.site_equipment(site_id);
CREATE INDEX idx_risk_findings_resolved ON public.risk_findings(resolved);

-- Trigger to update last_updated
CREATE OR REPLACE FUNCTION public.update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_site_chemicals_last_updated
BEFORE UPDATE ON public.site_chemicals
FOR EACH ROW
EXECUTE FUNCTION public.update_last_updated_column();

CREATE TRIGGER update_site_equipment_last_updated
BEFORE UPDATE ON public.site_equipment
FOR EACH ROW
EXECUTE FUNCTION public.update_last_updated_column();