import { supabase } from './supabase';

export async function getProgramDetails(programId: string) {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('id', programId)
    .single();

  if (error) throw error;
  return data;
}

export async function getAggregatedScores(programId: string) {
  try {
    const response = await fetch(`/api/programs/${programId}/scores`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch aggregated scores');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching aggregated scores:', error);
    return null;
  }
}

export async function getAllProgramsWithScores() {
  const { data, error } = await supabase
    .from('programs')
    .select(`
      *,
      reviews (
        competitiveness,
        social_opportunities,
        career_opportunities,
        teaching_quality,
        year_of_study
      )
    `)
    .order('name');

  if (error) throw error;

  // Calculate aggregated scores on client
  return data.map((program) => ({
    ...program,
    aggregatedScores: calculateAggregatedScores(program.reviews || []),
  }));
}

function calculateAggregatedScores(reviews: any[]) {
  if (reviews.length === 0) {
    return {
      competitiveness: 'N/A',
      socialOpportunities: 'N/A',
      careerOpportunities: 'N/A',
      teachingQuality: 'N/A',
      overallGrade: 'N/A',
      reviewCount: 0,
    };
  }

  // Weight by year of study (newer years weight less)
  const weights = {
    1: 1.0,
    2: 1.2,
    3: 1.4,
    4: 1.6,
    5: 1.8, // Postgraduate
  };

  const gradeValues = { A: 4, B: 3, C: 2, D: 1, F: 0 };
  const valueGrades = { 4: 'A', 3: 'B', 2: 'C', 1: 'D', 0: 'F' };

  const calculateWeightedAverage = (field: string) => {
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

    return valueGrades[roundedAverage as keyof typeof valueGrades] || 'C';
  };

  const competitiveness = calculateWeightedAverage('competitiveness');
  const socialOpportunities = calculateWeightedAverage('social_opportunities');
  const careerOpportunities = calculateWeightedAverage('career_opportunities');
  const teachingQuality = calculateWeightedAverage('teaching_quality');

  // Calculate overall grade from average of all categories
  const categoryValues = [
    gradeValues[competitiveness as keyof typeof gradeValues],
    gradeValues[socialOpportunities as keyof typeof gradeValues],
    gradeValues[careerOpportunities as keyof typeof gradeValues],
    gradeValues[teachingQuality as keyof typeof gradeValues],
  ];

  const overallValue = Math.round(
    categoryValues.reduce((a, b) => a + b, 0) / categoryValues.length
  );
  const overallGrade =
    valueGrades[overallValue as keyof typeof valueGrades] || 'C';

  return {
    competitiveness,
    socialOpportunities,
    careerOpportunities,
    teachingQuality,
    overallGrade,
    reviewCount: reviews.length,
  };
}
