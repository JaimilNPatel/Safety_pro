-- NH₃ Module Tables

create table if not exists nh3_lopa_scenarios (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  equipment_tag text,
  initiating_event text,
  initiating_freq numeric,
  consequence text,
  target_freq numeric,
  selected_layers jsonb,
  mitigated_freq numeric,
  rrf numeric,
  sil_required text,
  created_by uuid references auth.users,
  created_at timestamptz default now()
);

create table if not exists nh3_checklist_results (
  id uuid primary key default gen_random_uuid(),
  equipment_category text not null,
  inspector_id uuid references auth.users,
  inspection_date date not null,
  items jsonb not null,
  critical_failures int default 0,
  status text default 'complete',
  created_at timestamptz default now()
);

create table if not exists nh3_incidents (
  id uuid primary key default gen_random_uuid(),
  incident_type text,
  equipment text,
  failure_mode text,
  description text,
  immediate_cause text,
  root_causes jsonb,
  safeguards_worked text,
  safeguards_failed text,
  corrective_actions jsonb,
  severity int check (severity between 1 and 5),
  reported_by uuid references auth.users,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table nh3_lopa_scenarios enable row level security;
alter table nh3_checklist_results enable row level security;
alter table nh3_incidents enable row level security;

-- Create RLS Policies
create policy "authenticated users full access" on nh3_lopa_scenarios 
  for all 
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "authenticated users full access" on nh3_checklist_results 
  for all 
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "authenticated users full access" on nh3_incidents 
  for all 
  using (auth.uid() is not null)
  with check (auth.uid() is not null);
