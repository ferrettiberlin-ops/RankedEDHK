// scripts/setup_db.js
// Run with: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/setup_db.js
// This script will load .env.local if present to pick up SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

// It will also look for data/programs_seed.json to seed the program_list table.
// This script creates needed tables and seeds programs for MVP.

const { createClient } = require('@supabase/supabase-js');

async function main() {
  // Load .env.local if present
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch (e) {
    // ignore
  }

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in env');
    process.exit(1);
  }

  const svc = createClient(url, key);

  // Define SQL for tables
  const createReviewsTable = `
  CREATE TABLE IF NOT EXISTS public.reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text,
    university text,
    program text,
    year_of_study integer,
    competitiveness text,
    competition_text text,
    social text,
    social_text text,
    career text,
    career_text text,
    teaching text,
    teaching_text text,
    competitiveness_grade_valid boolean,
    social_grade_valid boolean,
    career_grade_valid boolean,
    teaching_grade_valid boolean,
    moderation_status text,
    created_at timestamptz DEFAULT now()
  );`;

  const createProgramsTable = `
  CREATE TABLE IF NOT EXISTS public.program_list (
    id serial PRIMARY KEY,
    university text,
    program text
  );`;

  try {
    console.log('Creating tables...');
    await svc.rpc('sql', { q: createReviewsTable }).catch(()=>{});
  } catch (e) {
    // Some Supabase instances disable rpc sql; fallback to REST via query
  }

  // Use SQL via REST API endpoint
  const sqlEndpoint = `${url.replace(/\/$/, '')}/rest/v1/rpc`; // not guaranteed available

  // Use the SQL Admin: create using Postgres function via query endpoint
  // Simpler: use the query endpoint /sql? (Supabase doesn't expose generic SQL via client), so use the Table creation via the Postgres client is not available.
  // We'll attempt to create tables via the Postgres `pg_execute` function if available, else instruct user.

  // Fallback: try using 'rpc' with 'pg_execute' or 'sql' -- this may fail on managed Supabase without extensions.
  try {
    await svc.rpc('pg_execute', { q: createReviewsTable });
    await svc.rpc('pg_execute', { q: createProgramsTable });
    console.log('Tables created via rpc pg_execute');
  } catch (err) {
    console.warn('Could not create tables via rpc. Falling back to REST table creation where possible.');
    // Try to create tables by inserting to them (will fail) or notify user
    console.warn('If tables were not created, run the SQL in migrations/create_tables.sql against your database using psql or Supabase SQL editor.');
  }

  // Seed programs from data/programs_seed.json if present, otherwise use small built-in list
  let programs = [];
  const fs = require('fs');
  const seedPath = './data/programs_seed.json';
  if (fs.existsSync(seedPath)) {
    try {
      const raw = fs.readFileSync(seedPath, 'utf8');
      programs = JSON.parse(raw);
      console.log(`Loaded ${programs.length} programs from ${seedPath}`);
    } catch (e) {
      console.warn('Failed to parse programs_seed.json', e.message || e);
    }
  }

  if (programs.length === 0) {
    programs = [
      { university: 'hku', program: 'Computer Science' },
      { university: 'hku', program: 'Business' },
      { university: 'hku', program: 'Medicine' },
      { university: 'hkust', program: 'Computer Science' },
      { university: 'hkust', program: 'Business' },
      { university: 'cuhk', program: 'Computer Science' },
      { university: 'polyu', program: 'Engineering' },
      { university: 'cityu', program: 'Business' },
    ];
    console.log('Using built-in fallback program list');
  }

  try {
    console.log('Seeding program_list...');
    for (const p of programs) {
      // Upsert by (university, program)
      await svc.from('program_list').upsert({ university: p.university, program: p.program }, { onConflict: ['university', 'program'] });
    }
    console.log('Seed complete.');
  } catch (err) {
    console.warn('Failed to seed program_list via Supabase client. You can seed using the SQL file or Supabase UI.');
  }

  console.log('Done. If any operations failed, please run migrations/create_tables.sql in Supabase SQL editor.');
}

main().catch(err => { console.error(err); process.exit(1); });
