-- Fix RLS Policies for NH3 Module Tables
-- Date: 2026-03-23

-- Drop existing problematic policies
DROP POLICY IF EXISTS "authenticated users full access" ON nh3_incidents;
DROP POLICY IF EXISTS "authenticated users full access" ON nh3_lopa_scenarios;
DROP POLICY IF EXISTS "authenticated users full access" ON nh3_checklist_results;

-- Create proper RLS Policies for nh3_incidents
CREATE POLICY "authenticated users full access" ON nh3_incidents 
  FOR ALL 
  USING (auth.uid() is not null)
  WITH CHECK (auth.uid() is not null);

-- Create proper RLS Policies for nh3_lopa_scenarios  
CREATE POLICY "authenticated users full access" ON nh3_lopa_scenarios 
  FOR ALL 
  USING (auth.uid() is not null)
  WITH CHECK (auth.uid() is not null);

-- Create proper RLS Policies for nh3_checklist_results
CREATE POLICY "authenticated users full access" ON nh3_checklist_results 
  FOR ALL 
  USING (auth.uid() is not null)
  WITH CHECK (auth.uid() is not null);
