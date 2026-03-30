import { NextRequest, NextResponse } from 'next/server';
import { moderateContent, checkGradeConsistency } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, grade } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request. Text is required.' },
        { status: 400 }
      );
    }

    if (text.length > 1000) {
      return NextResponse.json(
        { error: 'Text must be less than 1000 characters.' },
        { status: 400 }
      );
    }

    // Step 1: Moderate content for harmful material
    const moderationResult = await moderateContent(text);

    if (!moderationResult.isApproved) {
      return NextResponse.json({
        approved: false,
        reason: 'content_flagged',
        message: moderationResult.flagReason || 'Review contains inappropriate content',
        gradeValid: null,
      });
    }

    // Step 2: Check grade consistency if grade provided
    let gradeValid = true;
    let consistencyReasoning = '';

    if (grade && /^[A-F]$/.test(grade)) {
      const consistencyCheck = await checkGradeConsistency(grade, text);
      gradeValid = consistencyCheck.isConsistent;
      consistencyReasoning = consistencyCheck.reasoning;
    }

    return NextResponse.json({
      approved: true,
      gradeValid,
      consistencyReasoning,
      message: gradeValid
        ? 'Review approved and will be included in calculations'
        : 'Review approved but grade will be excluded from calculations due to inconsistency',
    });
  } catch (error) {
    console.error('Moderation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
