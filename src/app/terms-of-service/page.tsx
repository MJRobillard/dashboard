import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using WorkoutDash ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
              <p className="text-gray-700">
                These Terms of Service ("Terms") govern your use of our workout dashboard application and related services provided by WorkoutDash ("we," "our," or "us").
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                WorkoutDash is a fitness tracking and workout management application that provides:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Workout planning and tracking</li>
                <li>Fitness progress monitoring</li>
                <li>Google Calendar integration for scheduling</li>
                <li>Personalized dashboard and analytics</li>
                <li>Data visualization and reporting</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">3.1 Account Creation</h3>
              <p className="text-gray-700 mb-4">
                To use certain features of the Service, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your account information</li>
                <li>Keep your account credentials secure</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">3.2 Account Security</h3>
              <p className="text-gray-700 mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Maintaining the confidentiality of your password</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Ensuring you log out at the end of each session</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">4.1 Permitted Uses</h3>
              <p className="text-gray-700 mb-4">
                You may use the Service for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Personal fitness tracking and management</li>
                <li>Legitimate workout planning and scheduling</li>
                <li>Integration with your Google Calendar</li>
                <li>Data analysis and progress monitoring</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">4.2 Prohibited Uses</h3>
              <p className="text-gray-700 mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Share your account credentials with others</li>
                <li>Use the Service to harm, harass, or intimidate others</li>
                <li>Upload malicious code or attempt to compromise security</li>
                <li>Reverse engineer or attempt to extract source code</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Content</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">5.1 Content Ownership</h3>
              <p className="text-gray-700 mb-4">
                You retain ownership of any content you submit to the Service, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Workout data and fitness information</li>
                <li>Personal notes and comments</li>
                <li>Custom workout plans</li>
                <li>Profile information</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">5.2 License to Use</h3>
              <p className="text-gray-700 mb-4">
                By submitting content, you grant us a non-exclusive, worldwide, royalty-free license to:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Store and process your content to provide the Service</li>
                <li>Use your content to improve our services</li>
                <li>Generate aggregated, anonymized analytics</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">5.3 Content Responsibility</h3>
              <p className="text-gray-700">
                You are solely responsible for the content you submit and ensure it does not violate any third-party rights or applicable laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Third-Party Integrations</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">6.1 Google Calendar</h3>
              <p className="text-gray-700 mb-4">
                Our Service integrates with Google Calendar. By using this integration:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>You authorize us to access your Google Calendar data</li>
                <li>You agree to Google's Terms of Service and Privacy Policy</li>
                <li>You can revoke access at any time through Google settings</li>
                <li>We will only access data necessary for the Service</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">6.2 Third-Party Services</h3>
              <p className="text-gray-700">
                The Service may integrate with other third-party services. Use of these services is subject to their respective terms and privacy policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">7.1 Our Rights</h3>
              <p className="text-gray-700 mb-4">
                The Service and its original content, features, and functionality are owned by WorkoutDash and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3">7.2 Trademarks</h3>
              <p className="text-gray-700">
                "WorkoutDash" and related trademarks are the property of WorkoutDash. You may not use these marks without our prior written consent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Privacy and Data Protection</h2>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
              <p className="text-gray-700">
                By using the Service, you consent to the collection and use of information as outlined in our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Service Availability</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">9.1 Service Modifications</h3>
              <p className="text-gray-700 mb-4">
                We reserve the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Modify or discontinue the Service at any time</li>
                <li>Update features and functionality</li>
                <li>Change pricing with appropriate notice</li>
                <li>Limit access to certain features</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">9.2 Maintenance</h3>
              <p className="text-gray-700">
                We may perform maintenance that temporarily affects Service availability. We will provide reasonable notice when possible.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Disclaimers</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">10.1 Service "As Is"</h3>
              <p className="text-gray-700 mb-4">
                The Service is provided "as is" and "as available" without warranties of any kind, either express or implied.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3">10.2 Fitness Information</h3>
              <p className="text-gray-700 mb-4">
                The Service provides fitness tracking and planning tools but is not a substitute for professional medical advice. You should:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Consult healthcare professionals before starting new fitness programs</li>
                <li>Use the Service responsibly and within your physical capabilities</li>
                <li>Not rely solely on the Service for medical decisions</li>
                <li>Seek medical attention for any health concerns</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">10.3 Data Accuracy</h3>
              <p className="text-gray-700">
                While we strive for accuracy, we cannot guarantee that all information provided through the Service is error-free or up-to-date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                To the maximum extent permitted by law, WorkoutDash shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Loss of profits, data, or use</li>
                <li>Business interruption</li>
                <li>Personal injury or property damage</li>
                <li>Any damages resulting from use of the Service</li>
              </ul>
              <p className="text-gray-700">
                Our total liability shall not exceed the amount paid by you for the Service in the 12 months preceding the claim.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Indemnification</h2>
              <p className="text-gray-700">
                You agree to indemnify and hold harmless WorkoutDash from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Termination</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">13.1 Termination by You</h3>
              <p className="text-gray-700 mb-4">
                You may terminate your account at any time by contacting us or using the account deletion feature in the Service.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3">13.2 Termination by Us</h3>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your account immediately if:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>You violate these Terms</li>
                <li>You engage in fraudulent or illegal activities</li>
                <li>We discontinue the Service</li>
                <li>Required by law or regulation</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">13.3 Effect of Termination</h3>
              <p className="text-gray-700">
                Upon termination, your right to use the Service ceases immediately. We may delete your account and data, subject to our data retention policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Governing Law</h2>
              <p className="text-gray-700">
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Dispute Resolution</h2>
              <p className="text-gray-700 mb-4">
                Any disputes arising from these Terms or your use of the Service shall be resolved through:
              </p>
              <ol className="list-decimal pl-6 text-gray-700">
                <li>Good faith negotiations between the parties</li>
                <li>Mediation if negotiations fail</li>
                <li>Binding arbitration in [Your Jurisdiction]</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Severability</h2>
              <p className="text-gray-700">
                If any provision of these Terms is found to be unenforceable or invalid, the remaining provisions will continue in full force and effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">17. Changes to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or through the Service. Continued use after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">18. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@workoutdash.com<br />
                  <strong>Address:</strong> [Your Business Address]<br />
                  <strong>Phone:</strong> [Your Contact Number]
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">19. Entire Agreement</h2>
              <p className="text-gray-700">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and WorkoutDash regarding the use of the Service.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              By using WorkoutDash, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 