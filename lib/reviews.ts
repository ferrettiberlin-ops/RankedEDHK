import { supabase } from './supabase';
import { checkGradeConsistency } from './gemini';

export interface ReviewSubmission {
  programId: string;
  competitiveness: string;
  competitionText: string;
  socialOpportunities: string;
  socialText: string;
  careerOpportunities: string;
  careerText: string;
  teachingQuality: string;
  teachingText: string;
  yearOfStudy: number;
}

export async function submitReview(review: ReviewSubmission) {
  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('You must be logged in to submit a review');
  }

  // Check consistency of each grade with its text
  const [compConsistent, socialConsistent, careerConsistent, teachingConsistent] = await Promise.all([
    checkGradeConsistency(review.competitiveness, review.competitionText),
    checkGradeConsistency(review.socialOpportunities, review.socialText),
    checkGradeConsistency(review.careerOpportunities, review.careerText),
    checkGradeConsistency(review.teachingQuality, review.teachingText),
  ]);

  // Insert review into Supabase
  const { data, error } = await supabase.from('reviews').insert([
    {
      program_id: review.programId,
      user_id: user.id,
      competitiveness_grade: review.competitiveness,
      social_grade: review.socialOpportunities,
      career_grade: review.careerOpportunities,
      teaching_grade: review.teachingQuality,
      competitiveness_text: review.competitionText,
      social_text: review.socialText,
      career_text: review.careerText,
      teaching_text: review.teachingText,
      competitiveness_grade_valid: compConsistent.isConsistent,
      social_grade_valid: socialConsistent.isConsistent,
      career_grade_valid: careerConsistent.isConsistent,
      teaching_grade_valid: teachingConsistent.isConsistent,
      moderation_status: 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  if (error) throw error;
  return data?.[0] || {};
}

export async function getReviewsByProgram(programId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('program_id', programId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getReviewsByUser(userId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
