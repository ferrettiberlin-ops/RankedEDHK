'use client';

import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          RankedEDHK
        </Link>
        
        <div className="flex gap-6">
          <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
            Home
          </Link>
          <Link href="/universities" className="text-gray-700 hover:text-blue-600 font-medium">
            Universities
          </Link>
          <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium">
            About
          </Link>
        </div>

        <div className="flex gap-4">
          <Link href="/login" className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium">
            Login
          </Link>
          <Link href="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}
