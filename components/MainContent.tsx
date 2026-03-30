'use client';

import { useState, useEffect } from 'react';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import ProgramDetails from './ProgramDetails';

interface MainContentProps {
  selectedUniversity: string | null;
  selectedProgram: string | null;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function MainContent({
  selectedUniversity,
  selectedProgram,
  isLoading,
  setIsLoading,
}: MainContentProps) {
  return (
    <div className="p-8 max-w-4xl">
      {!selectedProgram ? (
        <div className="text-center py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to RankedEDHK
          </h1>
          <p className="text-lg text-gray-600">
            Select a university and program from the sidebar to view reviews and submit your own.
          </p>
          <p className="text-gray-500 mt-4">
            Only verified university students can submit reviews.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <ProgramDetails programId={selectedProgram} />
          
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit a Review</h2>
            <ReviewForm programId={selectedProgram} />
          </div>

          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Reviews</h2>
            <ReviewList programId={selectedProgram} />
          </div>
        </div>
      )}
    </div>
  );
}
