import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    const body = await req.json().catch(() => ({}));
    const token = (auth.startsWith('Bearer ') ? auth.slice(7) : auth) || body?.access_token;
    if (!token) return NextResponse.json({ error: 'missing access token' }, { status: 400 });

    const svc = getServiceRoleClient();
    // server-side: return the user associated with the access token
    // supabase-js exposes auth.getUser(token) on server clients
    const result = await (svc.auth as any).getUser(token);
    if (result?.error) return NextResponse.json({ error: result.error.message }, { status: 401 });
    return NextResponse.json({ user: result?.data?.user ?? null });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
