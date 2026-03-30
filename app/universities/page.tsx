'use client';

import Navigation from '@/components/Navigation';
import { useState, useEffect } from 'react';

interface University {
  code: string;
  name: string;
}

const UNIVERSITIES: University[] = [
  {
    code: 'HKU',
    name: 'University of Hong Kong (HKU)',
  },
  {
    code: 'HKUST',
    name: 'Hong Kong University of Science and Technology',
  },
  {
    code: 'CUHK',
    name: 'Chinese University of Hong Kong',
  },
  {
    code: 'POLYU',
    name: 'Hong Kong Polytechnic University',
  },
  {
    code: 'CITYU',
    name: 'City University of Hong Kong',
  },
  {
    code: 'HKBU',
    name: 'Hong Kong Baptist University',
  },
  {
    code: 'EDUHK',
    name: 'Education University of Hong Kong',
  },
  {
    code: 'LINGNAN',
    name: 'Lingnan University',
  },
];

export default function Universities() {
  const [stats, setStats] = useState<Record<string, number>>({});

  // In a real app, fetch program counts from the backend
  useEffect(() => {
    const mockStats: Record<string, number> = {
      HKU: 12,
      HKUST: 8,
      CUHK: 15,
      POLYU: 10,
      CITYU: 9,
      HKBU: 7,
      EDUHK: 6,
      LINGNAN: 5,
    };
    setStats(mockStats);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <div className="flex-1 max-w-5xl mx-auto px-6 py-16 w-full">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Hong Kong Universities</h1>
        <p className="text-lg text-gray-600 mb-12">
          Browse JUPAS programs from Hong Kong's leading universities
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {UNIVERSITIES.map((uni) => (
            <div
              key={uni.code}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{uni.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">Code: {uni.code}</p>
                </div>
              </div>

              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">
                  {stats[uni.code] || 0}
                </p>
                <p className="text-sm text-gray-600">JUPAS Programs</p>
              </div>

              <a
                href={`/?uni=${uni.code}`}
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                View Programs
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
