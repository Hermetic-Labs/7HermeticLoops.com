import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function TermsPage() {
    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-3xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyber-green mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <div className="cyber-panel p-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
                    <p className="text-gray-400 mb-8">
                        <strong>Hermetic Labs, LLC</strong> · Last Updated: February 2026
                    </p>

                    <div className="legal-content space-y-8 text-gray-300">
                        <section>
                            <h2 className="text-xl font-semibold text-cyber-green mb-3 pb-2 border-b border-gray-800">1. Agreement to Terms</h2>
                            <p>By accessing or using the EVE-OS website, platform, or any related services (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use our Services.</p>
                            <p className="mt-3">These Terms constitute a legally binding agreement between you and Hermetic Labs, LLC.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-cyber-green mb-3 pb-2 border-b border-gray-800">2. Description of Services</h2>
                            <h3 className="text-lg font-medium text-white mt-4 mb-2">2.1 Current Status</h3>
                            <p>EVE-OS is currently in <strong className="text-white">pre-release development</strong>. The platform, modules, and features displayed on our website are provided for informational and demonstration purposes only.</p>
                            <ul className="list-disc list-inside mt-3 space-y-1">
                                <li>Features marked "Coming Soon" are not yet available</li>
                                <li>Pricing, specifications, and availability are subject to change without notice</li>
                                <li>Beta access is granted at our sole discretion</li>
                            </ul>

                            <h3 className="text-lg font-medium text-white mt-4 mb-2">2.2 No Guarantee of Access</h3>
                            <p>Signing up for early access or joining our waitlist does not guarantee:</p>
                            <ul className="list-disc list-inside mt-3 space-y-1">
                                <li>Access to the platform or any specific features</li>
                                <li>Any particular timeline for availability</li>
                                <li>Inclusion in beta testing programs</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-cyber-green mb-3 pb-2 border-b border-gray-800">3. Eligibility</h2>
                            <p>To use our Services, you must:</p>
                            <ul className="list-disc list-inside mt-3 space-y-1">
                                <li>Be at least 18 years old (or the age of majority in your jurisdiction)</li>
                                <li>Have the legal capacity to enter into binding agreements</li>
                                <li>Not be prohibited from using the Services under applicable law</li>
                            </ul>
                            <p className="mt-3">If you are using the Services on behalf of an organization, you represent that you have authority to bind that organization to these Terms.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-cyber-green mb-3 pb-2 border-b border-gray-800">4. User Accounts and Registration</h2>
                            <h3 className="text-lg font-medium text-white mt-4 mb-2">4.1 Account Information</h3>
                            <p>When you register for early access or create an account, you agree to:</p>
                            <ul className="list-disc list-inside mt-3 space-y-1">
                                <li>Provide accurate, current, and complete information</li>
                                <li>Maintain and promptly update your information</li>
                                <li>Keep your login credentials secure and confidential</li>
                                <li>Notify us immediately of any unauthorized access</li>
                            </ul>

                            <h3 className="text-lg font-medium text-white mt-4 mb-2">4.2 Account Responsibility</h3>
                            <p>You are responsible for all activities that occur under your account, whether or not authorized by you.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-cyber-green mb-3 pb-2 border-b border-gray-800">5. Acceptable Use</h2>
                            <h3 className="text-lg font-medium text-white mt-4 mb-2">5.1 You Agree Not To:</h3>
                            <ul className="list-disc list-inside mt-3 space-y-1">
                                <li>Use the Services for any unlawful purpose</li>
                                <li>Attempt to gain unauthorized access to our systems or networks</li>
                                <li>Interfere with or disrupt the Services or servers</li>
                                <li>Reverse engineer, decompile, or disassemble any part of the Services</li>
                                <li>Use automated systems (bots, scrapers) without our written permission</li>
                                <li>Impersonate any person or entity</li>
                                <li>Upload or transmit malicious code</li>
                                <li>Violate any applicable laws or regulations</li>
                            </ul>

                            <h3 className="text-lg font-medium text-white mt-4 mb-2">5.2 Enforcement</h3>
                            <p>We reserve the right to suspend or terminate access for violations of these Terms, without prior notice.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-cyber-green mb-3 pb-2 border-b border-gray-800">6. Intellectual Property</h2>
                            <h3 className="text-lg font-medium text-white mt-4 mb-2">6.1 Our Intellectual Property</h3>
                            <p>All content, features, and functionality of the Services—including but not limited to text, graphics, logos, icons, images, audio, video, software, and the EVE-OS name and branding—are owned by Hermetic Labs or its licensors and are protected by intellectual property laws.</p>

                            <h3 className="text-lg font-medium text-white mt-4 mb-2">6.2 Limited License</h3>
                            <p>We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Services for your personal or internal business evaluation purposes, subject to these Terms.</p>

                            <h3 className="text-lg font-medium text-white mt-4 mb-2">6.3 Restrictions</h3>
                            <ul className="list-disc list-inside mt-3 space-y-1">
                                <li>Copy, modify, or distribute our content without permission</li>
                                <li>Use our trademarks without written authorization</li>
                                <li>Remove any copyright or proprietary notices</li>
                                <li>Create derivative works based on our Services</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-cyber-green mb-3 pb-2 border-b border-gray-800">7. Important Disclaimers</h2>
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 my-4">
                                <p className="font-semibold text-yellow-400 mb-2">NO PROFESSIONAL ADVICE</p>
                                <p className="text-sm">THE SERVICES DO NOT PROVIDE MEDICAL, LEGAL, FINANCIAL, COMPLIANCE, OR OTHER PROFESSIONAL ADVICE. EVE-OS is a software platform and development toolkit. Any modules related to regulated industries are provided as technical tools only.</p>
                            </div>

                            <h3 className="text-lg font-medium text-white mt-4 mb-2">7.1 "As Is" Disclaimer</h3>
                            <p>THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.</p>

                            <h3 className="text-lg font-medium text-white mt-4 mb-2">7.2 Beta Services</h3>
                            <p>Beta features and early access services are experimental. They may contain bugs, errors, or incomplete functionality. Use at your own risk.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-cyber-green mb-3 pb-2 border-b border-gray-800">8. Limitation of Liability</h2>
                            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, HERMETIC LABS SHALL NOT BE LIABLE FOR:</p>
                            <ul className="list-disc list-inside mt-3 space-y-1">
                                <li>Indirect, incidental, special, consequential, or punitive damages</li>
                                <li>Loss of profits, revenue, data, or business opportunities</li>
                                <li>Cost of substitute services</li>
                                <li>Any damages arising from your use or inability to use the Services</li>
                            </ul>
                            <p className="mt-3">OUR TOTAL LIABILITY SHALL NOT EXCEED THE GREATER OF: the amount you paid us in the 12 months preceding the claim, or $100 USD.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-cyber-green mb-3 pb-2 border-b border-gray-800">9. Indemnification</h2>
                            <p>You agree to indemnify, defend, and hold harmless Hermetic Labs and its officers, directors, employees, agents, and affiliates from any claims, damages, losses, liabilities, costs, and expenses arising from:</p>
                            <ul className="list-disc list-inside mt-3 space-y-1">
                                <li>Your use of the Services</li>
                                <li>Your violation of these Terms</li>
                                <li>Your violation of any third-party rights</li>
                                <li>Your violation of any applicable laws</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-cyber-green mb-3 pb-2 border-b border-gray-800">10. Governing Law and Dispute Resolution</h2>
                            <p>These Terms are governed by the laws of the State of Georgia, United States, without regard to conflict of law principles.</p>
                            <p className="mt-3 font-medium text-white">CLASS ACTION WAIVER: You agree to resolve disputes individually and waive any right to participate in class actions or class arbitration.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-cyber-green mb-3 pb-2 border-b border-gray-800">11. Termination</h2>
                            <p>We may suspend or terminate your access at any time, with or without cause, with or without notice. You may stop using the Services at any time.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-cyber-green mb-3 pb-2 border-b border-gray-800">12. Contact Information</h2>
                            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mt-4">
                                <p className="font-semibold text-cyber-green">Hermetic Labs, LLC</p>
                                <p className="mt-2">Email: <a href="mailto:DwayneTillman@7HermeticLabs.Dev" className="text-cyber-green hover:underline">DwayneTillman@7HermeticLabs.Dev</a></p>
                                <p>Website: <a href="https://7hermeticlabs.com" className="text-cyber-green hover:underline">7hermeticlabs.com</a></p>
                            </div>
                        </section>

                        <p className="text-sm text-gray-500 italic border-t border-gray-800 pt-6">
                            These Terms of Service are provided for informational purposes and should be reviewed by legal counsel before implementation.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
