import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';
import crypto from 'crypto';

type Body = { email?: string };

function genCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendEmailViaSendGrid(to: string, code: string) {
  const key = process.env.SENDGRID_API_KEY;
  if (!key) throw new Error('no sendgrid key');
  let res;
  try {
    res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: process.env.VERIFY_FROM_EMAIL || 'no-reply@example.com' },
        subject: 'Verify Your Account',
        content: [{ type: 'text/plain', value: `Verify Your Account\n\nYour verification code is: ${code}\n\nThis code expires in 15 minutes.` }]
      })
    });
  } catch (e: any) {
    throw new Error('network error sending email: ' + (e?.message || String(e)));
  }

  if (!res.ok) {
    const bodyText = await res.text().catch(() => '<no-body>');
    // include sendgrid status/body for debugging (does not contain our code)
    throw new Error(`sendgrid failed: ${res.status} ${res.statusText} - ${bodyText.substring(0,1000)}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Body;
    const email = (body.email || '').trim().toLowerCase();
    if (!email) return NextResponse.json({ error: 'missing email' }, { status: 400 });

    // simple domain check — ensure it's a school email (you can adjust rules)
    // Accept common university domains and known subdomains (e.g. connect.ust.hk)
    const allowedDomains = [
      'hku.hk',
      'connect.hku.hk',
      'ug.hku.hk',
      'cuhk.edu.hk',
      'link.cuhk.edu.hk',
      'ust.hk',
      'connect.ust.hk',
      'polyu.edu.hk',
      'cityu.edu.hk',
      'eduhk.hk',
      'ln.edu.hk',
      'hkmu.edu.hk',
      'hkbu.edu.hk'
    ];
    const domain = email.split('@')[1] || '';
    if (!allowedDomains.some(d => domain === d || domain.endsWith('.' + d))) {
      return NextResponse.json({ error: 'email domain not allowed' }, { status: 400 });
    }

    const code = genCode();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15).toISOString(); // 15m

    const svc = getServiceRoleClient();
    // store a hash of the code rather than the plaintext code
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    await svc.from('email_verifications').insert({ email, code: codeHash, expires_at: expiresAt });

    // For a simple local MVP, bypass SendGrid and return the code when in development
    // or when MVP_MODE=true in the environment. This keeps production unchanged.
    const devAllow = process.env.MVP_MODE === 'true' || process.env.NODE_ENV !== 'production';
    if (devAllow) {
      return NextResponse.json({ ok: true, message: 'Dev: code generated', dev_code: code });
    }

    // In non-dev (production) flow, require SendGrid to be configured for real verification emails.
    if (!process.env.SENDGRID_API_KEY || !process.env.VERIFY_FROM_EMAIL) {
      // Do not expose the verification code in responses or logs.
      return NextResponse.json({ error: 'email sending not configured; set SENDGRID_API_KEY and VERIFY_FROM_EMAIL' }, { status: 500 });
    }

    try {
      await sendEmailViaSendGrid(email, code);
    } catch (e: any) {
      const msg = e?.message || 'failed to send email';
      console.error('sendgrid error', msg);
      // Return the error message to help debug SendGrid failures (does not contain the verification code)
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    // Successful: do not return or log the verification code.
    return NextResponse.json({ ok: true, message: 'Verification sent' });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 });
  }
}
