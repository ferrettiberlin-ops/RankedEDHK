import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Moderate content for harmful/offensive material
 */
export async function moderateContent(text: string): Promise<{
  isApproved: boolean;
  flagReason?: string;
  confidence?: number;
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are a content moderator for university student reviews on an academic platform.
    
Analyze the following review text and determine if it contains inappropriate content.

Check for:
1. Hate speech, discrimination, or bigotry
2. Personal attacks, harassment, or bullying
3. Profanity or highly offensive language
4. Defamatory statements
5. Spam, advertising, or off-topic content
6. Threats or incitement to violence
7. Illegal activity or encouragement thereof

Be lenient but firm. Academic criticism, disagreement, and negative feedback are acceptable. Only flag genuinely harmful content.

Review text: "${text}"

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "isApproved": boolean,
  "flagReason": "reason if not approved, null if approved",
  "confidence": number between 0 and 1
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not parse Gemini response:', responseText);
      return { isApproved: true };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      isApproved: parsed.isApproved,
      flagReason: parsed.flagReason,
      confidence: parsed.confidence,
    };
  } catch (error) {
    console.error('Gemini moderation error:', error);
    // Return approved by default if service fails to prevent blocking submissions
    return { isApproved: true };
  }
}

/**
 * Check if text review is consistent with letter grade
 * Returns true if consistent, false if inconsistent
 */
export async function checkGradeConsistency(
  gradeValue: string,
  reviewText: string
): Promise<{
  isConsistent: boolean;
  reasoning: string;
  confidence: number;
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const gradeDefinitions: Record<string, string> = {
      A: 'Excellent program with strong positives mentioned throughout',
      B: 'Good program with mostly positive feedback and minor criticisms',
      C: 'Average program with mixed positives and negatives',
      D: 'Below average program with mostly negative feedback',
      F: 'Poor program with strong criticisms and few positives',
    };

    const prompt = `You are evaluating consistency between a student review text and an assigned letter grade for an academic program.

Letter Grade: ${gradeValue}
Expected Tone for ${gradeValue}: ${gradeDefinitions[gradeValue] || 'Unknown'}

Student Review: "${reviewText}"

Determine if the review text is consistent with the assigned grade. Consider:
- Overall tone (positive for A/B, negative for D/F, balanced for C)
- Specific criticisms or praise mentioned
- Whether the grade accurately reflects the review content
- Allow for nuance (a B review might have some criticisms)

Respond ONLY with valid JSON:
{
  "isConsistent": boolean,
  "reasoning": "brief explanation of consistency assessment",
  "confidence": number between 0 and 1
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not parse consistency response:', responseText);
      return { isConsistent: true, reasoning: 'Unable to verify consistency', confidence: 0.5 };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      isConsistent: parsed.isConsistent,
      reasoning: parsed.reasoning,
      confidence: parsed.confidence,
    };
  } catch (error) {
    console.error('Gemini consistency check error:', error);
    // Default to consistent if check fails
    return { isConsistent: true, reasoning: 'Consistency check unavailable', confidence: 0 };
  }
}
