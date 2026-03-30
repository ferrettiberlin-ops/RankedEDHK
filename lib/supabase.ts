import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
