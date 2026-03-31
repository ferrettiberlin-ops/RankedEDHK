import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || '').trim().toLowerCase();
    const code = (body.code || '').trim();
    if (!email || !code) return NextResponse.json({ error: 'missing email or code' }, { status: 400 });

    const svc = getServiceRoleClient();
    // compare using hash to avoid keeping/verifying plaintext codes
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    const { data } = await svc.from('email_verifications').select('*').eq('email', email).eq('code', codeHash).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (!data) return NextResponse.json({ error: 'invalid code' }, { status: 400 });
    const expires = new Date(data.expires_at);
    if (expires < new Date()) return NextResponse.json({ error: 'code expired' }, { status: 400 });

    // upsert into verified_emails
    await svc.from('verified_emails').upsert({ email, verified_at: new Date().toISOString() }, { onConflict: 'email' });

    // optionally remove used codes
    await svc.from('email_verifications').delete().eq('id', data.id);

    return NextResponse.json({ ok: true, email });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 });
  }
}
