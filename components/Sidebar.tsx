'use client';

import { useState, useEffect } from 'react';
import { getUniversities, getProgramsByUniversity } from '@/lib/supabase';

interface SidebarProps {
  onUniversitySelect: (university: string | null) => void;
  onProgramSelect: (program: string | null) => void;
  selectedUniversity: string | null;
  selectedProgram: string | null;
}

interface University {
  id: string;
  name: string;
  code: string;
}

interface Program {
  id: string;
  name: string;
  code: string;
  university_id: string;
}

export default function Sidebar({
  onUniversitySelect,
  onProgramSelect,
  selectedUniversity,
  selectedProgram,
}: SidebarProps) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [expandedUni, setExpandedUni] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const UNIVERSITIES = [
    { id: 'hku', name: 'University of Hong Kong (HKU)', code: 'HKU' },
    { id: 'hkust', name: 'HKUST', code: 'HKUST' },
    { id: 'cuhk', name: 'Chinese University of Hong Kong (CUHK)', code: 'CUHK' },
    { id: 'polyu', name: 'PolyU', code: 'POLYU' },
    { id: 'cityu', name: 'City University of Hong Kong (CityU)', code: 'CITYU' },
    { id: 'hkbu', name: 'Hong Kong Baptist University (HKBU)', code: 'HKBU' },
    { id: 'eduhk', name: 'Education University of Hong Kong (EdUHK)', code: 'EDUHK' },
    { id: 'lingnan', name: 'Lingnan University', code: 'LINGNAN' },
  ];

  useEffect(() => {
    setUniversities(UNIVERSITIES);
    setLoading(false);
  }, []);

  const handleUniversityClick = async (uniCode: string) => {
    setExpandedUni(expandedUni === uniCode ? null : uniCode);
    
    if (expandedUni !== uniCode) {
      try {
        const data = await getProgramsByUniversity(uniCode);
        setPrograms(data || []);
        onUniversitySelect(uniCode);
        onProgramSelect(null);
      } catch (error) {
        console.error('Failed to fetch programs:', error);
      }
    }
  };

  const handleProgramClick = (programId: string) => {
    onProgramSelect(programId);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Universities</h2>
      
      {loading ? (
        <p className="text-gray-500 text-center">Loading...</p>
      ) : (
        <div className="space-y-2">
          {universities.map((uni) => (
            <div key={uni.id}>
              <button
                onClick={() => handleUniversityClick(uni.code)}
                className={`w-full text-left px-3 py-2 rounded-lg transition ${
                  expandedUni === uni.code
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="inline-block mr-2">
                  {expandedUni === uni.code ? '▼' : '▶'}
                </span>
                {uni.name}
              </button>

              {expandedUni === uni.code && programs.length > 0 && (
                <div className="ml-4 mt-2 space-y-1 border-l-2 border-blue-200 pl-2">
                  {programs.map((program) => (
                    <button
                      key={program.id}
                      onClick={() => handleProgramClick(program.id)}
                      className={`block w-full text-left px-3 py-1 rounded text-sm transition ${
                        selectedProgram === program.id
                          ? 'bg-blue-500 text-white font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {program.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
