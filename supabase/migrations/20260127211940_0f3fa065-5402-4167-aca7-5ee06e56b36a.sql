-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Create sites table
CREATE TABLE public.sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  site_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on sites
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

-- Sites policies
CREATE POLICY "Users can view their own sites"
ON public.sites FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sites"
ON public.sites FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sites"
ON public.sites FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sites"
ON public.sites FOR DELETE
USING (auth.uid() = user_id);

-- Create inspections table
CREATE TABLE public.inspections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  inspection_type TEXT NOT NULL CHECK (inspection_type IN ('new', 'routine')),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on inspections
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

-- Inspections policies
CREATE POLICY "Users can view their own inspections"
ON public.inspections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inspections"
ON public.inspections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inspections"
ON public.inspections FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inspections"
ON public.inspections FOR DELETE
USING (auth.uid() = user_id);

-- Create chemicals reference table (public, no RLS needed for read)
CREATE TABLE public.chemicals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cas_number TEXT NOT NULL UNIQUE,
  flash_point NUMERIC,
  boiling_point NUMERIC,
  idlh_ppm NUMERIC,
  reactivity_group TEXT NOT NULL,
  material_factor NUMERIC DEFAULT 1,
  heat_of_combustion NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on chemicals (allow public read)
ALTER TABLE public.chemicals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read chemicals"
ON public.chemicals FOR SELECT
USING (true);

-- Create inspection_chemicals junction table
CREATE TABLE public.inspection_chemicals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  chemical_id UUID NOT NULL REFERENCES public.chemicals(id) ON DELETE CASCADE,
  quantity_kg NUMERIC NOT NULL,
  storage_temp_c NUMERIC NOT NULL DEFAULT 25,
  pressure_atm NUMERIC NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on inspection_chemicals
ALTER TABLE public.inspection_chemicals ENABLE ROW LEVEL SECURITY;

-- Policy to allow access based on inspection ownership
CREATE POLICY "Users can manage their inspection chemicals"
ON public.inspection_chemicals FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.inspections 
    WHERE inspections.id = inspection_chemicals.inspection_id 
    AND inspections.user_id = auth.uid()
  )
);

-- Create inspection_equipment table
CREATE TABLE public.inspection_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  equipment_type TEXT NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('good', 'fair', 'poor')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on inspection_equipment
ALTER TABLE public.inspection_equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their inspection equipment"
ON public.inspection_equipment FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.inspections 
    WHERE inspections.id = inspection_equipment.inspection_id 
    AND inspections.user_id = auth.uid()
  )
);

-- Create routine_checklist table for routine inspection responses
CREATE TABLE public.routine_checklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item TEXT NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on routine_checklist
ALTER TABLE public.routine_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their routine checklist"
ON public.routine_checklist FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.inspections 
    WHERE inspections.id = routine_checklist.inspection_id 
    AND inspections.user_id = auth.uid()
  )
);

-- Create inspection_notes table
CREATE TABLE public.inspection_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on inspection_notes
ALTER TABLE public.inspection_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their inspection notes"
ON public.inspection_notes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.inspections 
    WHERE inspections.id = inspection_notes.inspection_id 
    AND inspections.user_id = auth.uid()
  )
);

-- Create risk_findings table for screening results
CREATE TABLE public.risk_findings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  finding_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'pass')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT,
  score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on risk_findings
ALTER TABLE public.risk_findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their risk findings"
ON public.risk_findings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.inspections 
    WHERE inspections.id = risk_findings.inspection_id 
    AND inspections.user_id = auth.uid()
  )
);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sites_updated_at
BEFORE UPDATE ON public.sites
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();