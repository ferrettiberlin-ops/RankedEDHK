'use client';

import { useEffect, useState } from 'react';
import { getProgramDetails, getAggregatedScores } from '@/lib/programs';

interface ProgramDetailsProps {
  programId: string;
}

interface Program {
  id: string;
  name: string;
  code: string;
  university_id: string;
  description: string;
}

interface AggregatedScores {
  competitiveness: string;
  socialOpportunities: string;
  careerOpportunities: string;
  teachingQuality: string;
  overallGrade: string;
  reviewCount: number;
}

const getGradeColor = (grade: string) => {
  const colors: Record<string, string> = {
    A: 'bg-green-100 text-green-800 border-green-300',
    B: 'bg-blue-100 text-blue-800 border-blue-300',
    C: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    D: 'bg-orange-100 text-orange-800 border-orange-300',
    F: 'bg-red-100 text-red-800 border-red-300',
  };
  return colors[grade] || 'bg-gray-100 text-gray-800 border-gray-300';
};

export default function ProgramDetails({ programId }: ProgramDetailsProps) {
  const [program, setProgram] = useState<Program | null>(null);
  const [scores, setScores] = useState<AggregatedScores | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [programData, scoresData] = await Promise.all([
          getProgramDetails(programId),
          getAggregatedScores(programId),
        ]);
        setProgram(programData);
        setScores(scoresData);
      } catch (error) {
        console.error('Failed to fetch program details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (programId) {
      fetchDetails();
    }
  }, [programId]);

  if (loading) {
    return <div className="text-center text-gray-500">Loading program details...</div>;
  }

  if (!program) {
    return <div className="text-center text-gray-500">Program not found.</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{program.name}</h1>
        <p className="text-gray-600">Program Code: {program.code}</p>
      </div>

      {program.description && (
        <div className="mb-6">
          <p className="text-gray-700">{program.description}</p>
        </div>
      )}

      {scores && (
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Program Ratings ({scores.reviewCount} reviews)
          </h2>

          <div className="grid grid-cols-5 gap-4">
            {[
              { label: 'Competitiveness', value: scores.competitiveness },
              { label: 'Social Opportunities', value: scores.socialOpportunities },
              { label: 'Career Opportunities', value: scores.careerOpportunities },
              { label: 'Teaching Quality', value: scores.teachingQuality },
              { label: 'Overall Grade', value: scores.overallGrade },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-sm text-gray-600 mb-2">{label}</p>
                <div
                  className={`text-3xl font-bold text-center py-4 rounded border-2 ${getGradeColor(
                    value
                  )}`}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
