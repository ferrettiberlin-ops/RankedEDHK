#!/usr/bin/env node
/**
 * JUPAS Program Scraper
 * Fetches program data from JUPAS website and stores in Supabase
 * Should be run as a scheduled job (e.g., via Vercel Cron or GitHub Actions)
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const UNIVERSITIES = [
  { code: 'HKU', url: 'https://www.jupas.edu.hk/en/programme/hku/' },
  { code: 'HKUST', url: 'https://www.jupas.edu.hk/en/programme/hkust/' },
  { code: 'CUHK', url: 'https://www.jupas.edu.hk/en/programme/cuhk/' },
  { code: 'POLYU', url: 'https://www.jupas.edu.hk/en/programme/polyu/' },
  { code: 'CITYU', url: 'https://www.jupas.edu.hk/en/programme/cityuhk/' },
  { code: 'HKBU', url: 'https://www.jupas.edu.hk/en/programme/hkbu/' },
  { code: 'EDUHK', url: 'https://www.jupas.edu.hk/en/programme/eduhk/' },
  { code: 'LINGNAN', url: 'https://www.jupas.edu.hk/en/programme/lingnanu/' },
];

async function scrapeUniversityPrograms(universityCode, url) {
  try {
    console.log(`Scraping programs for ${universityCode}...`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const programs = [];
    
    // Adjust selector based on actual JUPAS website structure
    // This is a placeholder - update based on actual HTML structure
    $('tr').each((index, element) => {
      const cells = $(element).find('td');
      if (cells.length >= 3) {
        const code = $(cells[0]).text().trim();
        const name = $(cells[1]).text().trim();
        const description = $(cells[2]).text().trim();

        if (code && name) {
          programs.push({
            code,
            name,
            description,
            university_code: universityCode,
          });
        }
      }
    });

    console.log(`Found ${programs.length} programs for ${universityCode}`);
    return programs;
  } catch (error) {
    console.error(`Error scraping ${universityCode}:`, error.message);
    return [];
  }
}

async function upsertPrograms(programs, universityCode) {
  try {
    if (programs.length === 0) {
      console.log(`No programs to upsert for ${universityCode}`);
      return;
    }

    // First, get the university ID
    const { data: uni, error: uniError } = await supabase
      .from('universities')
      .select('id')
      .eq('code', universityCode)
      .single();

    if (uniError) {
      throw new Error(`Could not find university ${universityCode}: ${uniError.message}`);
    }

    const programsWithUniversityId = programs.map((program) => ({
      ...program,
      university_id: uni.id,
    }));

    const { error } = await supabase
      .from('programs')
      .upsert(programsWithUniversityId, { onConflict: 'code,university_id' });

    if (error) {
      throw error;
    }

    console.log(`Successfully upserted ${programs.length} programs for ${universityCode}`);
  } catch (error) {
    console.error(`Error upserting programs for ${universityCode}:`, error.message);
  }
}

async function runScraper() {
  console.log('Starting JUPAS program scraper...');
  console.log(`Scraping ${UNIVERSITIES.length} universities`);

  for (const { code, url } of UNIVERSITIES) {
    const programs = await scrapeUniversityPrograms(code, url);
    await upsertPrograms(programs, code);
    
    // Rate limiting to avoid overwhelming the server
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log('Scraper completed!');
}

// Run the scraper
runScraper().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
