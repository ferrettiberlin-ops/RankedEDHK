'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';

export default function Home() {
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-screen">
      <Navigation />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <Sidebar
            onUniversitySelect={() => {}}
            onProgramSelect={setSelectedProgram}
            selectedProgram={selectedProgram}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <MainContent selectedProgram={selectedProgram} />
        </div>
      </div>
    </div>
  );
}
