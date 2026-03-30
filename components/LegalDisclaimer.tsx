'use client';

export default function LegalDisclaimer() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Legal Disclaimer</h2>
        <p className="text-lg text-gray-800 leading-relaxed">
          All reviews on this platform are anonymous student opinions. They do not represent the views of RankedEDHK, 
          its developers, or any university. Reviews are published at the sole responsibility of the student author. 
          The platform is not liable for any opinions expressed.
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Anonymous Nature of Reviews</h3>
          <p className="text-gray-700 leading-relaxed">
            Reviews submitted to this platform are displayed anonymously. Your email address and personal identifying 
            information are used only for one-time verification purposes and are never stored in our database or displayed publicly.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Content Responsibility</h3>
          <p className="text-gray-700 leading-relaxed">
            You are solely responsible for the content of your review. By submitting a review, you agree that:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3 ml-4">
            <li>Your review is truthful and based on your genuine experience</li>
            <li>You will not post defamatory, discriminatory, or illegal content</li>
            <li>You will not harass, threaten, or abuse other students or institutions</li>
            <li>You will not post spam, advertising, or off-topic content</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Moderation & Removal</h3>
          <p className="text-gray-700 leading-relaxed">
            RankedEDHK reserves the right to moderate, edit, or remove any review that violates our policies. 
            Removed content will not appear publicly, and grades may be excluded from program calculations if 
            found to be inconsistent with review text.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">4. Grade Accuracy</h3>
          <p className="text-gray-700 leading-relaxed">
            For reviews to be included in aggregated program ratings, your letter grades must be consistent with 
            your written review text. Reviews with inconsistent grades will still be published anonymously but 
            excluded from score calculations.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">5. No Liability</h3>
          <p className="text-gray-700 leading-relaxed">
            RankedEDHK, its developers, and partner universities are not liable for any direct, indirect, or 
            consequential damages arising from the use of reviews or opinions posted on this platform. The platform 
            is provided "as is" for informational purposes only.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">6. Privacy</h3>
          <p className="text-gray-700 leading-relaxed">
            Your university email is used only for verification. We never store, sell, or share your email with 
            third parties. You can delete your account and associated reviews at any time by contacting us.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">7. Terms of Service Changes</h3>
          <p className="text-gray-700 leading-relaxed">
            We may update these terms at any time. Your continued use of the platform constitutes acceptance of 
            the updated terms.
          </p>
        </section>

        <div className="bg-gray-100 p-6 rounded-lg mt-8">
          <p className="text-sm text-gray-600">
            <strong>Last Updated:</strong> March 2026
          </p>
          <p className="text-sm text-gray-600 mt-2">
            By accessing RankedEDHK, you acknowledge that you have read, understood, and agree to be bound by 
            these legal terms.
          </p>
        </div>
      </div>
    </div>
  );
}
