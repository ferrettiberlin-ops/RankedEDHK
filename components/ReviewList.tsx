'use client';

import { useEffect, useState } from 'react';
import { getReviewsByProgram } from '@/lib/reviews';

interface ReviewListProps {
  programId: string;
}

interface Review {
  id: string;
  text_review: string;
  competitiveness: string;
  social_opportunities: string;
  career_opportunities: string;
  teaching_quality: string;
  year_of_study: number;
  created_at: string;
  user_email: string;
}

const getGradeColor = (grade: string) => {
  const colors: Record<string, string> = {
    A: 'text-green-700 bg-green-50',
    B: 'text-blue-700 bg-blue-50',
    C: 'text-yellow-700 bg-yellow-50',
    D: 'text-orange-700 bg-orange-50',
    F: 'text-red-700 bg-red-50',
  };
  return colors[grade] || 'text-gray-700 bg-gray-50';
};

export default function ReviewList({ programId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getReviewsByProgram(programId);
        setReviews(data || []);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    if (programId) {
      fetchReviews();
    }
  }, [programId]);

  if (loading) {
    return <div className="text-center text-gray-500">Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reviews yet. Be the first to review this program!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-medium text-gray-900">
                Year {review.year_of_study} Student
              </p>
              <p className="text-sm text-gray-500">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              {
                label: 'Competitiveness',
                value: review.competitiveness,
              },
              {
                label: 'Social Ops',
                value: review.social_opportunities,
              },
              {
                label: 'Career Ops',
                value: review.career_opportunities,
              },
              {
                label: 'Teaching',
                value: review.teaching_quality,
              },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <div className={`text-lg font-bold px-3 py-1 rounded ${getGradeColor(value)}`}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          <p className="text-gray-700">{review.text_review}</p>
        </div>
      ))}
    </div>
  );
}
