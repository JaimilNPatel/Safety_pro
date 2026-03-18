
ALTER TABLE public.chemicals
  ADD COLUMN molecular_weight numeric NULL,
  ADD COLUMN density_kg_m3 numeric NULL,
  ADD COLUMN vapor_pressure_kpa numeric NULL,
  ADD COLUMN auto_ignition_temp_c numeric NULL,
  ADD COLUMN lower_explosive_limit numeric NULL,
  ADD COLUMN upper_explosive_limit numeric NULL,
  ADD COLUMN specific_heat_kj_kgk numeric NULL,
  ADD COLUMN viscosity_cp numeric NULL,
  ADD COLUMN vapor_density numeric NULL,
  ADD COLUMN log_kow numeric NULL,
  ADD COLUMN nfpa_health integer NULL DEFAULT 0,
  ADD COLUMN nfpa_fire integer NULL DEFAULT 0,
  ADD COLUMN nfpa_reactivity integer NULL DEFAULT 0;
