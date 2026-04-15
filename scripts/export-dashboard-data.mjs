import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

async function loadDotEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  try {
    const raw = await fs.readFile(envPath, 'utf8');
    const lines = raw.split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;

      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();

      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env file is optional; existing process.env vars still work.
  }
}

await loadDotEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase environment variables.');
  console.error('Set VITE_SUPABASE_URL (or SUPABASE_URL) and one of:');
  console.error('- SUPABASE_SERVICE_ROLE_KEY (recommended for full export)');
  console.error('- VITE_SUPABASE_PUBLISHABLE_KEY / SUPABASE_ANON_KEY (RLS-limited export)');
  process.exit(1);
}

const TABLES = [
  'chemicals',
  'profiles',
  'sites',
  'site_chemicals',
  'site_equipment',
  'inspections',
  'inspection_chemicals',
  'inspection_equipment',
  'inspection_notes',
  'generated_checklist',
  'routine_checklist',
  'risk_findings',
  'nh3_incidents',
  'nh3_lopa_scenarios',
  'nh3_checklist_results',
];

const OUTPUT_DIR = path.resolve(process.cwd(), 'exports', `csv-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}`);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

function csvEscape(value) {
  if (value === null || value === undefined) return '';

  let str;
  if (typeof value === 'object') {
    str = JSON.stringify(value);
  } else {
    str = String(value);
  }

  if (str.includes('"')) {
    str = str.replace(/"/g, '""');
  }

  if (str.includes(',') || str.includes('\n') || str.includes('\r') || str.includes('"')) {
    return `"${str}"`;
  }

  return str;
}

function toCsv(rows) {
  if (!rows.length) {
    return '';
  }

  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set())
  );

  const lines = [headers.join(',')];

  for (const row of rows) {
    const line = headers.map((header) => csvEscape(row[header])).join(',');
    lines.push(line);
  }

  return `${lines.join('\n')}\n`;
}

async function fetchAllRows(tableName) {
  const pageSize = 1000;
  let from = 0;
  let to = pageSize - 1;
  const allRows = [];

  while (true) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .range(from, to);

    if (error) {
      throw new Error(`${tableName}: ${error.message}`);
    }

    if (!data || data.length === 0) {
      break;
    }

    allRows.push(...data);

    if (data.length < pageSize) {
      break;
    }

    from += pageSize;
    to += pageSize;
  }

  return allRows;
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  console.log(`Exporting dashboard data to: ${OUTPUT_DIR}`);

  const summary = [];

  for (const table of TABLES) {
    try {
      const rows = await fetchAllRows(table);
      const csv = toCsv(rows);
      const filePath = path.join(OUTPUT_DIR, `${table}.csv`);

      await fs.writeFile(filePath, csv, 'utf8');
      summary.push({ table, count: rows.length, status: 'ok' });
      console.log(`- ${table}: ${rows.length} rows`);
    } catch (error) {
      summary.push({ table, count: 0, status: 'error', message: error.message });
      console.error(`- ${table}: ERROR (${error.message})`);
    }
  }

  const summaryPath = path.join(OUTPUT_DIR, 'export-summary.json');
  await fs.writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

  const hasError = summary.some((item) => item.status === 'error');
  if (hasError) {
    console.error('Export completed with some errors. Check export-summary.json.');
    process.exitCode = 1;
    return;
  }

  console.log('Export completed successfully.');
}

main().catch((error) => {
  console.error('Fatal export error:', error.message);
  process.exit(1);
});
