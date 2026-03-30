/**
 * Hugging Face Inference API Integration for Content Moderation
 * Uses free/paid models from Hugging Face hub
 */

const apiKey = process.env.HF_API_KEY;

if (!apiKey) {
  throw new Error('Missing HF_API_KEY environment variable');
}

/**
 * Call Hugging Face Inference API
 * Uses the text-moderation model for safety checks
 */
async function callHuggingFaceAPI(
  prompt: string,
  model: string = 'facebook/bart-large-mnli'
): Promise<any> {
  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        method: 'POST',
        body: JSON.stringify({
          inputs: prompt,
          options: { wait_for_model: true },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HF API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Hugging Face API error:', error);
    // Return approved by default if service fails to prevent blocking submissions
    return null;
  }
}

/**
 * Moderate content for harmful/inappropriate material
 * Uses zero-shot classification to detect unsafe content
 */
export async function moderateContentHF(text: string): Promise<{
  isApproved: boolean;
  flagReason?: string;
  confidence?: number;
}> {
  try {
    // Use zero-shot classification to check for offensive content
    const prompt = `Does this text contain hate speech, harassment, explicit content, or threats?

Text: "${text}"

Labels: offensive, not_offensive`;

    const result = await callHuggingFaceAPI(prompt);

    if (!result) {
      // Service unavailable, approve by default
      return { isApproved: true };
    }

    // Check if model detected offensive content
    // Result format: [{ sequence: "text", scores: [...], labels: [...] }]
    const scores = result[0]?.scores || [];
    const labels = result[0]?.labels || [];

    // Find offensive label score
    const offensiveIndex = labels.indexOf('offensive');
    const offensiveScore = offensiveIndex !== -1 ? scores[offensiveIndex] : 0;

    // Flag if offensive confidence > 70%
    const isFlagged = offensiveScore > 0.7;

    return {
      isApproved: !isFlagged,
      flagReason: isFlagged
        ? 'Review contains offensive, hateful, or inappropriate content'
        : undefined,
      confidence: offensiveScore,
    };
  } catch (error) {
    console.error('Content moderation error:', error);
    // Return approved by default if service fails
    return { isApproved: true };
  }
}

/**
 * Check if review text is consistent with assigned grade
 * Uses sentiment analysis to validate grade-text alignment
 */
export async function checkGradeConsistencyHF(
  gradeValue: string,
  reviewText: string
): Promise<{
  isConsistent: boolean;
  reasoning: string;
  confidence: number;
}> {
  try {
    // Grade definitions for validation
    const gradeExpectations: Record<string, string> = {
      A: 'excellent, positive, highly satisfied, outstanding, great',
      B: 'good, satisfied, mostly positive, well done, nice',
      C: 'average, mixed, neutral, okay, decent',
      D: 'poor, unsatisfied, mostly negative, disappointed, issues',
      F: 'terrible, very negative, worst, completely unsatisfied, awful',
    };

    const expectedSentiment = gradeExpectations[gradeValue] || 'neutral';

    // Use zero-shot to check sentiment alignment
    const prompt = `Classify the sentiment of this review as: very_positive, positive, neutral, negative, very_negative

Review: "${reviewText}"

Candidate labels: very_positive, positive, neutral, negative, very_negative`;

    const result = await callHuggingFaceAPI(prompt);

    if (!result) {
      // Service unavailable, assume consistent
      return {
        isConsistent: true,
        reasoning: 'Unable to verify consistency',
        confidence: 0.5,
      };
    }

    // Map detected sentiment to grade expectations
    const detectedLabel = result[0]?.labels?.[0] || 'neutral';
    const sentimentScores = result[0]?.scores || [];

    // Check consistency based on grade and detected sentiment
    let isConsistent = false;
    let confidence = 0;

    switch (gradeValue) {
      case 'A':
        isConsistent =
          ['very_positive', 'positive'].includes(detectedLabel);
        confidence = sentimentScores[0] || 0;
        break;
      case 'B':
        isConsistent = ['positive', 'very_positive', 'neutral'].includes(
          detectedLabel
        );
        confidence = sentimentScores[0] || 0;
        break;
      case 'C':
        isConsistent = ['neutral', 'positive', 'negative'].includes(
          detectedLabel
        );
        confidence = sentimentScores[0] || 0;
        break;
      case 'D':
        isConsistent = ['negative', 'neutral', 'very_negative'].includes(
          detectedLabel
        );
        confidence = sentimentScores[0] || 0;
        break;
      case 'F':
        isConsistent = ['very_negative', 'negative'].includes(detectedLabel);
        confidence = sentimentScores[0] || 0;
        break;
    }

    return {
      isConsistent,
      reasoning: isConsistent
        ? `Grade ${gradeValue} matches detected sentiment (${detectedLabel})`
        : `Grade ${gradeValue} does not match detected sentiment (${detectedLabel}). Review will be published but grade excluded from calculations.`,
      confidence,
    };
  } catch (error) {
    console.error('Grade consistency check error:', error);
    // Return consistent by default if service fails
    return {
      isConsistent: true,
      reasoning: 'Unable to verify grade consistency',
      confidence: 0.5,
    };
  }
}
