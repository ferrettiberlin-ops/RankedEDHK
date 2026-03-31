import { NextResponse } from 'next/server';

export async function GET() {
  const key = process.env.SENDGRID_API_KEY;
  if (!key) return NextResponse.json({ ok: false, error: 'SENDGRID_API_KEY not configured' }, { status: 500 });

  try {
    const res = await fetch('https://api.sendgrid.com/v3/user/account', {
      headers: { Authorization: `Bearer ${key}` },
      method: 'GET',
    });

    const text = await res.text();
    let body: any = text;
    try { body = JSON.parse(text); } catch (_) { /* keep raw text */ }

    return NextResponse.json({ ok: res.ok, status: res.status, statusText: res.statusText, body }, { status: res.ok ? 200 : 502 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}
