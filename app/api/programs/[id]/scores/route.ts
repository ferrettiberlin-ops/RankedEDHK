import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const gradeValues = { A: 4, B: 3, C: 2, D: 1, F: 0 };
const valueGrades: Record<number, string> = {
  4: 'A',
  3: 'B',
  2: 'C',
  1: 'D',
  0: 'F',
};

const weights = {
  1: 1.0,
  2: 1.2,
  3: 1.4,
  4: 1.6,
  5: 1.8,
};

function calculateWeightedAverage(
  reviews: any[],
  field: string
): string {
  if (reviews.length === 0) return 'N/A';

  let totalWeight = 0;
  let weightedSum = 0;

  reviews.forEach((review) => {
    const weight = weights[review.year_of_study as keyof typeof weights] || 1;
    const grade = review[field];
    const value = gradeValues[grade as keyof typeof gradeValues] || 0;

    weightedSum += value * weight;
    totalWeight += weight;
  });

  const average = weightedSum / totalWeight;
  const roundedAverage = Math.round(average);

  return valueGrades[roundedAverage] || 'C';
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const programId = params.id;

    // Fetch all reviews for the program
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('competitiveness, social_opportunities, career_opportunities, teaching_quality, year_of_study')
      .eq('program_id', programId);

    if (error) throw error;

    if (!reviews || reviews.length === 0) {
      return NextResponse.json({
        competitiveness: 'N/A',
        socialOpportunities: 'N/A',
        careerOpportunities: 'N/A',
        teachingQuality: 'N/A',
        overallGrade: 'N/A',
        reviewCount: 0,
      });
    }

    // Calculate weighted averages for each category
    const competitiveness = calculateWeightedAverage(reviews, 'competitiveness');
    const socialOpportunities = calculateWeightedAverage(reviews, 'social_opportunities');
    const careerOpportunities = calculateWeightedAverage(reviews, 'career_opportunities');
    const teachingQuality = calculateWeightedAverage(reviews, 'teaching_quality');

    // Calculate overall grade
    const categoryValues = [
      gradeValues[competitiveness as keyof typeof gradeValues] || 0,
      gradeValues[socialOpportunities as keyof typeof gradeValues] || 0,
      gradeValues[careerOpportunities as keyof typeof gradeValues] || 0,
      gradeValues[teachingQuality as keyof typeof gradeValues] || 0,
    ];

    const overallValue = Math.round(
      categoryValues.reduce((a, b) => a + b, 0) / categoryValues.length
    );
    const overallGrade = valueGrades[overallValue] || 'C';

    return NextResponse.json({
      competitiveness,
      socialOpportunities,
      careerOpportunities,
      teachingQuality,
      overallGrade,
      reviewCount: reviews.length,
    });
  } catch (error) {
    console.error('Scores API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch aggregated scores' },
      { status: 500 }
    );
  }
}
