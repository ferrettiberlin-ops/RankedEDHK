'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';

export default function Home() {
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      <Navigation />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <Sidebar
            onUniversitySelect={setSelectedUniversity}
            onProgramSelect={setSelectedProgram}
            selectedUniversity={selectedUniversity}
            selectedProgram={selectedProgram}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <MainContent
            selectedUniversity={selectedUniversity}
            selectedProgram={selectedProgram}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </div>
      </div>
    </div>
  );
}
