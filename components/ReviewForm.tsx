'use client';

import { useState } from 'react';
import RiskWarningModal from './RiskWarningModal';
import { submitReview } from '@/lib/reviews';

interface ReviewFormProps {
  programId: string;
}

interface SubmitReviewResult {
  competitiveness_grade_valid?: boolean;
  social_grade_valid?: boolean;
  career_grade_valid?: boolean;
  teaching_grade_valid?: boolean;
  [key: string]: any;
}

const GRADE_OPTIONS = ['A', 'B', 'C', 'D', 'F'];

export default function ReviewForm({ programId }: ReviewFormProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [formData, setFormData] = useState({
    competitiveness: 'B',
    competitionText: '',
    socialOpportunities: 'B',
    socialText: '',
    careerOpportunities: 'B',
    careerText: '',
    teachingQuality: 'B',
    teachingText: '',
    yearOfStudy: '1',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'warning';
    text: string;
  } | null>(null);

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate all text fields are filled
    if (!formData.competitionText || !formData.socialText || 
        !formData.careerText || !formData.teachingText) {
      setMessage({
        type: 'error',
        text: 'Please fill in all review text fields',
      });
      return;
    }
    setShowWarning(true);
  };

  const handleWarningAccepted = async () => {
    setShowWarning(false);
    setIsSubmitting(true);
    setMessage(null);

    try {
      const result: SubmitReviewResult = await submitReview({
        programId,
        competitiveness: formData.competitiveness,
        competitionText: formData.competitionText,
        socialOpportunities: formData.socialOpportunities,
        socialText: formData.socialText,
        careerOpportunities: formData.careerOpportunities,
        careerText: formData.careerText,
        teachingQuality: formData.teachingQuality,
        teachingText: formData.teachingText,
        yearOfStudy: parseInt(formData.yearOfStudy),
      });

      // Check if any grades were invalidated
      const invalidGrades = [];
      if (!result.competitiveness_grade_valid) invalidGrades.push('Competitiveness');
      if (!result.social_grade_valid) invalidGrades.push('Social');
      if (!result.career_grade_valid) invalidGrades.push('Career');
      if (!result.teaching_grade_valid) invalidGrades.push('Teaching');

      if (invalidGrades.length > 0) {
        setMessage({
          type: 'warning',
          text: `Review submitted! Note: Grades for ${invalidGrades.join(', ')} were inconsistent with your text and excluded from program calculations.`,
        });
      } else {
        setMessage({
          type: 'success',
          text: 'Review submitted successfully and included in program ratings!',
        });
      }

      // Reset form
      setFormData({
        competitiveness: 'B',
        competitionText: '',
        socialOpportunities: 'B',
        socialText: '',
        careerOpportunities: 'B',
        careerText: '',
        teachingQuality: 'B',
        teachingText: '',
        yearOfStudy: '1',
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to submit review. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <RiskWarningModal
        isOpen={showWarning}
        onAccept={handleWarningAccepted}
        onCancel={() => setShowWarning(false)}
      />

      <form onSubmit={handleSubmitClick} className="bg-white rounded-lg shadow p-6 space-y-6">
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : message.type === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Competitiveness */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            1. Competitiveness After Entry
          </label>
          <select
            value={formData.competitiveness}
            onChange={(e) =>
              setFormData({ ...formData, competitiveness: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          >
            {GRADE_OPTIONS.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
          <textarea
            value={formData.competitionText}
            onChange={(e) =>
              setFormData({ ...formData, competitionText: e.target.value })
            }
            maxLength={300}
            placeholder="Explain your grade. Is the program competitive? Easy/hard to get into?"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.competitionText.length}/300 characters
          </p>
        </div>

        {/* Social Opportunities */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            2. Social Opportunities
          </label>
          <select
            value={formData.socialOpportunities}
            onChange={(e) =>
              setFormData({ ...formData, socialOpportunities: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          >
            {GRADE_OPTIONS.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
          <textarea
            value={formData.socialText}
            onChange={(e) =>
              setFormData({ ...formData, socialText: e.target.value })
            }
            maxLength={300}
            placeholder="Describe the social life and community. Are there clubs, events, friendships?"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.socialText.length}/300 characters
          </p>
        </div>

        {/* Career Opportunities */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            3. Career/Future Opportunities
          </label>
          <select
            value={formData.careerOpportunities}
            onChange={(e) =>
              setFormData({ ...formData, careerOpportunities: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          >
            {GRADE_OPTIONS.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
          <textarea
            value={formData.careerText}
            onChange={(e) =>
              setFormData({ ...formData, careerText: e.target.value })
            }
            maxLength={300}
            placeholder="How does this program help with career prospects? Job opportunities after graduation?"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.careerText.length}/300 characters
          </p>
        </div>

        {/* Teaching Quality */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            4. Teaching/Education Quality
          </label>
          <select
            value={formData.teachingQuality}
            onChange={(e) =>
              setFormData({ ...formData, teachingQuality: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          >
            {GRADE_OPTIONS.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
          <textarea
            value={formData.teachingText}
            onChange={(e) =>
              setFormData({ ...formData, teachingText: e.target.value })
            }
            maxLength={300}
            placeholder="Evaluate the quality of teaching, professors, coursework, and learning materials."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.teachingText.length}/300 characters
          </p>
        </div>

        {/* Year of Study */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Year of Study
          </label>
          <select
            value={formData.yearOfStudy}
            onChange={(e) =>
              setFormData({ ...formData, yearOfStudy: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
            <option value="5">Postgraduate</option>
          </select>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>📌 Remember:</strong> Your review will be published anonymously. Make sure your grades match your written feedback for accuracy.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {isSubmitting ? 'Submitting...' : 'Review & Submit'}
        </button>
      </form>
    </>
  );
}
