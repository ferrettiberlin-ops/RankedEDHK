import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const uni = url.searchParams.get('uni');

    // Try to fetch from Supabase program_list
    try {
      const svc = getServiceRoleClient();
      const { data, error } = await svc.from('program_list').select('program').order('id', { ascending: true }).eq('university', uni);
      if (error) throw error;
      const programs = (data || []).map((r: any) => r.program);
      return NextResponse.json({ programs });
    } catch (dbErr) {
      // Fallback: return built-in mock list
      const fallback = {
        hku: ['Computer Science','Business','Medicine','Law','Engineering'],
        hkust: ['Computer Science','Business','Engineering','Physics','Chemistry'],
        cuhk: ['Computer Science','Business','Medicine','Philosophy','Fine Arts'],
        polyu: ['Engineering','Business','Design','Building & Real Estate','Accountancy'],
        cityu: ['Business','Engineering','Science','Design','Creative Media'],
        lingnan: ['Business','Social Sciences','Humanities','Philosophy'],
        ouhk: ['Business','Science & Technology','Humanities','Law']
      };
      return NextResponse.json({ programs: fallback[uni as keyof typeof fallback] || [] });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch programs' }, { status: 500 });
  }
}
