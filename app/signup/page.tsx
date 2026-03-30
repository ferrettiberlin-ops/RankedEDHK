'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useState } from 'react';

const HK_UNIVERSITIES = [
  { code: 'hku', name: 'University of Hong Kong (HKU)', domain: 'hku.hk' },
  { code: 'hkust', name: 'HKUST', domain: 'ust.hk' },
  { code: 'cuhk', name: 'Chinese University of Hong Kong', domain: 'cuhk.edu.hk' },
  { code: 'polyu', name: 'PolyU', domain: 'polyu.edu.hk' },
  { code: 'cityu', name: 'City University of Hong Kong', domain: 'cityu.edu.hk' },
  { code: 'hkbu', name: 'Hong Kong Baptist University', domain: 'hkbu.edu.hk' },
  { code: 'eduhk', name: 'Education University of Hong Kong', domain: 'eduhk.hk' },
  { code: 'lingnan', name: 'Lingnan University', domain: 'lingnan.edu.hk' },
];

export default function SignUp() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    yearOfStudy: '1',
    university: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const selectedUni = HK_UNIVERSITIES.find((u) => u.code === formData.university);
    if (!selectedUni) {
      return { valid: false, error: 'Please select a university' };
    }
    if (!email.endsWith(`@${selectedUni.domain}`)) {
      return {
        valid: false,
        error: `Email must be from your university domain (@${selectedUni.domain})`,
      };
    }
    return { valid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate email domain
      const validation = validateEmail(formData.email);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (formData.password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      // TODO: Implement Better-Auth signup
      console.log('Signup with:', formData);

      setSuccess(true);
      setError('Authentication not yet configured. Please configure Better-Auth.');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600 mb-8">Join verified students reviewing JUPAS programs</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg">
              Account created! Check your email to verify your account.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                University
              </label>
              <select
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select your university</option>
                {HK_UNIVERSITIES.map((uni) => (
                  <option key={uni.code} value={uni.code}>
                    {uni.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                University Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.name@university.hk"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {formData.university && (
                <p className="text-xs text-gray-500 mt-1">
                  Must end with @{HK_UNIVERSITIES.find((u) => u.code === formData.university)?.domain}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year of Study
              </label>
              <select
                value={formData.yearOfStudy}
                onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
                <option value="5">Postgraduate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Login
            </Link>
          </p>

          <div className="mt-6 space-y-3 text-sm text-gray-600">
            <p className="font-semibold">Verification Process:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Sign up with your university email</li>
              <li>Check your email for verification link</li>
              <li>Verify within 15 minutes</li>
              <li>Start reviewing programs!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
