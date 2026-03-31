import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use NEXT_PUBLIC_ANON_KEY (matches .env.local) for the public anon key
const supabaseAnonKey = process.env.NEXT_PUBLIC_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase credentials. Please fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  );
  // Create a dummy client for development to prevent crashes
  // Real operations will fail, but app will load
  if (typeof window === 'undefined') {
    // Server-side: throw error to catch at build time
    throw new Error(
      'Missing Supabase environment variables. Fill in .env.local with your Supabase project credentials (from Settings → API)'
    );
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

// University functions
export async function getUniversities() {
  const { data, error } = await supabase
    .from('universities')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data;
}

// Program functions
export async function getProgramsByUniversity(universityCode: string) {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('university_code', universityCode)
    .order('name');
  
  if (error) throw error;
  return data;
}

export async function getAllPrograms() {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .order('university_code, name');
  
  if (error) throw error;
  return data;
}

// Helper for server-side operations
export function getServiceRoleClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }
  
  return createClient(supabaseUrl!, serviceRoleKey);
}
