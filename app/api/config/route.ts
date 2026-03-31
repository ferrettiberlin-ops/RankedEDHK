import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const anon = process.env.NEXT_PUBLIC_ANON_KEY || '';
    return NextResponse.json({ url, anon });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to read config' }, { status: 500 });
  }
}
