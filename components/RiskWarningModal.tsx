'use client';

import { useState } from 'react';

interface RiskWarningModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

export default function RiskWarningModal({ isOpen, onAccept, onCancel }: RiskWarningModalProps) {
  const [acceptedWarning, setAcceptedWarning] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-red-50 border-b border-red-200 px-6 py-4">
          <h2 className="text-xl font-bold text-red-800">⚠️ Risk Warning</h2>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-800 text-sm leading-relaxed font-semibold">
            By posting a review, you acknowledge the risks of sharing opinions publicly:
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 space-y-3">
            <div className="flex gap-3">
              <span className="text-red-600 font-bold text-lg">•</span>
              <p className="text-sm text-gray-700">
                <strong>Public Visibility:</strong> Your review will be visible to all users of this platform, 
                including students, educators, and the general public.
              </p>
            </div>

            <div className="flex gap-3">
              <span className="text-red-600 font-bold text-lg">•</span>
              <p className="text-sm text-gray-700">
                <strong>Content Responsibility:</strong> You are solely responsible for the opinions and statements 
                in your review.
              </p>
            </div>

            <div className="flex gap-3">
              <span className="text-red-600 font-bold text-lg">•</span>
              <p className="text-sm text-gray-700">
                <strong>Moderation:</strong> Offensive, defamatory, or unlawful content will be blocked.
              </p>
            </div>

            <div className="flex gap-3">
              <span className="text-red-600 font-bold text-lg">•</span>
              <p className="text-sm text-gray-700">
                <strong>Grade Consistency:</strong> Reviews with grades inconsistent with written text will be 
                excluded from program score calculations.
              </p>
            </div>

            <div className="flex gap-3">
              <span className="text-red-600 font-bold text-lg">•</span>
              <p className="text-sm text-gray-700">
                <strong>No Liability:</strong> RankedEDHK is not liable for consequences arising from your review.
              </p>
            </div>
          </div>

          <p className="text-gray-700 text-sm pt-2">
            Ensure your review is honest, constructive, and respectful to all parties involved.
          </p>

          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded">
            <input
              type="checkbox"
              id="accept-warning"
              checked={acceptedWarning}
              onChange={(e) => setAcceptedWarning(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300"
            />
            <label htmlFor="accept-warning" className="text-sm text-gray-700">
              I acknowledge these risks and will post responsibly
            </label>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onAccept}
            disabled={!acceptedWarning}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
