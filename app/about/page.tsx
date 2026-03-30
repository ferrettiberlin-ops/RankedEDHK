'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';

export default function About() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <div className="flex-1 max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About RankedEDHK</h1>
        
        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-lg">
              RankedEDHK is a platform dedicated to helping Hong Kong university students make informed decisions about JUPAS programs. By sharing honest reviews and ratings from verified current students, we empower prospective students to choose programs that best align with their goals.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How It Works</h2>
            <ol className="space-y-3 text-lg list-decimal list-inside">
              <li>Verified university students sign up with their university email</li>
              <li>After email verification, they can submit reviews for programs</li>
              <li>Each review includes 4 grades: Competitiveness, Social Opportunities, Career Opportunities, and Teaching Quality</li>
              <li>Reviews are aggregated using weighted scoring (older students' reviews weight more)</li>
              <li>Overall program grades are displayed for all students to see</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Supported Universities</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                'University of Hong Kong (HKU)',
                'HKUST',
                'Chinese University of Hong Kong (CUHK)',
                'PolyU',
                'City University of Hong Kong (CityU)',
                'Hong Kong Baptist University (HKBU)',
                'Education University of Hong Kong (EdUHK)',
                'Lingnan University',
              ].map((uni) => (
                <div key={uni} className="flex items-center">
                  <span className="text-blue-600 mr-2">✓</span>
                  {uni}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Safety & Moderation</h2>
            <p className="text-lg">
              All reviews are automatically moderated using AI to ensure respectful, constructive feedback. We remove content that contains harassment, hate speech, or spam. Only verified university students can submit reviews, maintaining the integrity of our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Privacy</h2>
            <p className="text-lg">
              We respect your privacy. Your email is used only for verification purposes. Reviews are anonymous (no identifying information beyond verification status). You can delete your reviews at any time.
            </p>
          </section>

          <div className="border-t pt-8 mt-8">
            <p className="text-lg mb-4">Ready to get started?</p>
            <Link href="/signup" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
              Sign Up Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
