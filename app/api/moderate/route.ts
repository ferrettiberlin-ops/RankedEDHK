import { NextRequest, NextResponse } from 'next/server';
import { moderateContentHF, checkGradeConsistencyHF } from '@/lib/hf-moderation';

/**
 * Moderation API Route
 * Validates review content and grade consistency using Hugging Face Inference API
 * 
 * POST /api/moderate
 * Body: { text: string, grade: string (A-F) }
 * Response: { approved: boolean, gradeValid?: boolean, message: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, grade } = body;

    // Validate input
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

    // Step 1: Moderate content for harmful/unsafe material
    const moderationResult = await moderateContentHF(text);

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
      const consistencyCheck = await checkGradeConsistencyHF(grade, text);
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
      { error: 'Internal server error during moderation' },
      { status: 500 }
    );
  }
}
