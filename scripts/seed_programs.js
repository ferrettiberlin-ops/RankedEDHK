// scripts/seed_programs.js
// Reads data/programs_seed.json and upserts into Supabase program_list
// Usage: node scripts/seed_programs.js

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing SUPABASE URL or SERVICE ROLE KEY in .env.local');
    process.exit(1);
  }
  const svc = createClient(url, key);

  const seedPath = path.resolve(process.cwd(), 'data', 'programs_seed.json');
  if (!fs.existsSync(seedPath)) {
    console.error('Seed file not found:', seedPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(seedPath, 'utf8');
  const objs = JSON.parse(raw);
  console.log('Loaded', objs.length, 'program records');

  // Upsert in small batches
  // Insert records if they do not already exist (avoids requiring UNIQUE constraint)
  for (let i = 0; i < objs.length; i++) {
    const o = objs[i];
    try {
      const { data: found, error: selErr } = await svc.from('program_list').select('id').match({ university: o.university, program: o.program }).maybeSingle();
      if (selErr) {
        console.error('Select error:', selErr);
        process.exit(1);
      }
      if (!found) {
        const { error: insErr } = await svc.from('program_list').insert({ university: o.university, program: o.program });
        if (insErr) {
          console.error('Insert error:', insErr);
          process.exit(1);
        }
      }
      if ((i + 1) % 50 === 0) console.log(`Processed ${i + 1}/${objs.length}`);
    } catch (e) {
      console.error('Unexpected error while seeding', e);
      process.exit(1);
    }
  }

  console.log('Seeding complete');
}

main().catch(err => { console.error(err); process.exit(1); });
