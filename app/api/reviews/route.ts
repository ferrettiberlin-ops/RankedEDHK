import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';
import { moderateContentHF, checkGradeConsistencyHF } from '@/lib/hf-moderation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = (body.email || '').toLowerCase().trim();
    const university = body.university || body.programUniversity || body.uni || null;
    const program = body.programId || body.program || body.programName || null;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const svc = getServiceRoleClient();

    // Require verified email
    try {
      const v = await svc.from('verified_emails').select('email').eq('email', email).maybeSingle();
      if (!v || !v.data) {
        return NextResponse.json({ error: 'Email not verified. Please verify your school email before submitting.' }, { status: 403 });
      }
    } catch (e) {
      // If verification table not accessible, fail closed for safety
      console.warn('Verification check failed:', e?.message || e);
      return NextResponse.json({ error: 'Unable to verify email at this time' }, { status: 503 });
    }

    // Enforce one review per email (global) - if DB unavailable, skip check and continue
    let existing = null;
    try {
      const res = await svc.from('reviews').select('id').eq('email', email).maybeSingle();
      existing = res.data || null;
      if (res.error) {
        // If DB returns an error like missing table, log and continue to fallback path
        console.warn('Unable to check existing reviews in DB:', res.error.message || res.error);
        existing = null;
      }
    } catch (e) {
      // DB not reachable or table missing — continue and use local fallback later
      console.warn('Error checking existing review:', e?.message || e);
      existing = null;
    }

    if (existing) {
      return NextResponse.json({ error: 'Email already used for a review' }, { status: 409 });
    }

    // Run moderation on all text fields
    const texts = [body.competitionText, body.socialText, body.careerText, body.teachingText].filter(Boolean);
    for (const t of texts) {
      const mod = await moderateContentHF(t);
      if (!mod.isApproved) {
        return NextResponse.json({ approved: false, message: 'Content flagged', reason: mod.flagReason }, { status: 200 });
      }
    }

    // Check grade consistency per field
    const compCheck = await checkGradeConsistencyHF(body.competitiveness, body.competitionText || '');
    const socialCheck = await checkGradeConsistencyHF(body.socialOpportunities || body.social, body.socialText || '');
    const careerCheck = await checkGradeConsistencyHF(body.careerOpportunities || body.career, body.careerText || '');
    const teachingCheck = await checkGradeConsistencyHF(body.teachingQuality || body.teaching, body.teachingText || '');

    // Insert review using service role client
    const insertPayload: any = {
      email,
      university: university || body.university || null,
      program: program || null,
      year_of_study: body.yearOfStudy || null,
      competitiveness: body.competitiveness,
      competition_text: body.competitionText,
      social: body.socialOpportunities || body.social,
      social_text: body.socialText,
      career: body.careerOpportunities || body.career,
      career_text: body.careerText,
      teaching: body.teachingQuality || body.teaching,
      teaching_text: body.teachingText,
      competitiveness_grade_valid: compCheck.isConsistent,
      social_grade_valid: socialCheck.isConsistent,
      career_grade_valid: careerCheck.isConsistent,
      teaching_grade_valid: teachingCheck.isConsistent,
      moderation_status: 'approved',
      created_at: new Date().toISOString(),
    };

    try {
      const { data: inserted, error: insertError } = await svc.from('reviews').insert([insertPayload]).select().single();
      if (insertError) throw insertError;
      return NextResponse.json({ inserted });
    } catch (dbErr) {
      // Attempt local fallback storage for MVP when DB insert fails or table missing
      try {
        const { writeFileSync, existsSync, mkdirSync, readFileSync } = await import('fs');
        const dir = './data';
        const path = `${dir}/reviews_local.json`;
        if (!existsSync(dir)) mkdirSync(dir);
        let arr = [];
        if (existsSync(path)) {
          const raw = readFileSync(path, 'utf8');
          arr = JSON.parse(raw || '[]');
        }
        arr.unshift(insertPayload);
        writeFileSync(path, JSON.stringify(arr, null, 2));
        return NextResponse.json({ inserted: insertPayload, fallback: 'local' });
      } catch (fsErr) {
        // If fallback also fails, return DB error
        throw dbErr;
      }
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit review' }, { status: 500 });
  }
}
