import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function PrivacyPage() {
    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-3xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyber-green mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <div className="cyber-panel p-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
                    <p className="text-gray-400 mb-8">
                        <strong>Hermetic Labs, LLC</strong> · Last Updated: February 2026
                    </p>

                    <div className="legal-content space-y-8 text-gray-300">
                        <section>
                            <h2 className="text-xl font-semibold text-cyber-green mb-3 pb-2 border-b border-gray-800">1. Introduction</h2>
                            <p>This Privacy Policy explains how Hermetic Labs, LLC collects, uses, stores, and protects your personal information when you visit our website, sign up for early access to EVE-OS, or interact with our services.</p>
                            <p className="mt-3">We are committed to protecting your privacy and handling your data transparently. This policy applies to all visitors and users of our website and services worldwide.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-cyber-green mb-3 pb-2 border-b border-gray-800">2. Information We Collect</h2>
                            <h3 className="text-lg font-medium text-white mt-4 mb-2">2.1 Information You Provide Directly</h3>
                            <p>When you sign up for early access or contact us, we may collect:</p>

                            <div className="overflow-x-auto mt-4">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="text-left py-2 px-3 text-cyber-green font-semibold">Data Type</th>
                                            <th className="text-left py-2 px-3 text-cyber-green font-semibold">Purpose</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-300">
                                        <tr className="border-b border-gray-800"><td className="py-2 px-3 font-medium text-white">Email Address</td><td className="py-2 px-3">To communicate about EVE-OS, beta access, and updates</td></tr>
                                        <tr className="border-b border-gray-800"><td className="py-2 px-3 font-medium text-white">Full Name</td><td className="py-2 px-3">To personalize communications and identify your account</td></tr>
                                        <tr className="border-b border-gray-800"><td className="py-2 px-3 font-medium text-white">Company/Organization</td><td className="py-2 px-3">To understand your professional context</td></tr>
                                        <tr className="border-b border-gray-800"><td className="py-2 px-3 font-medium text-white">Role/Title</td><td className="py-2 px-3">To better understand your needs and use case</td></tr>
                                        <tr className="border-b border-gray-800"><td className="py-2 px-3 font-medium text-white">Intended Use Case</td><td className="py-2 px-3">To evaluate beta access and improve our product</td></tr>
                                    </tbody>
                                </table>
                            </div>

                            <h3 className="text-lg font-medium text-white mt-6 mb-2">2.2 Information Collected Automatically</h3>
                            <ul className="list-disc list-inside space-y-1">
                                <li><strong className="text-white">Device Information:</strong> Browser type, operating system, device type</li>
                                <li><strong className="text-white">Usage Data:</strong> Pages visited, time spent, click patterns</li>
                                <li><strong className="text-white">Technical Data:</strong> IP address, approximate location (country/region level)</li>
                                <li><strong className="text-white">Cookies:</strong> See our <Link to="/cookies" className="text-cyber-green hover:underline">Cookie Policy</Link></li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-cyber-green mb-3 pb-2 border-b border-gray-800">3. How We Use Your Information</h2>
                            <div className="overflow-x-auto mt-4">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="text-left py-2 px-3 text-cyber-green font-semibold">Purpose</th>
                                            <th className="text-left py-2 px-3 text-cyber-green font-semibold">Legal Basis (GDPR)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-300">
                                        <tr className="border-b border-gray-800"><td className="py-2 px-3">Process and evaluate beta access applications</td><td className="py-2 px-3">Legitimate Interest</td></tr>
                                        <tr className="border-b border-gray-800"><td className="py-2 px-3">Send product updates and announcements</td><td className="py-2 px-3">Consent / Legitimate Interest</td></tr>
                                        <tr className="border-b border-gray-800"><td className="py-2 px-3">Improve our website and services</td><td className="py-2 px-3">Legitimate Interest</td></tr>
                                        <tr className="border-b border-gray-800"><td className="py-2 px-3">Respond to inquiries and provide support</td><td className="py-2 px-3">Contractual Necessity</td></tr>
                                        <tr className="border-b border-gray-800"><td className="py-2 px-3">Comply with legal obligations</td><td className="py-2 px-3">Legal Obligation</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="mt-4 font-medium text-white">We will never sell your personal information to third parties.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-cyber-green mb-3 pb-2 border-b border-gray-800">4. How We Share Your Information</h2>
                            <h3 className="text-lg font-medium text-white mt-4 mb-2">4.1 Service Providers</h3>
                            <p>Third-party vendors who help us operate our business:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Email service providers (for communications)</li>
                                <li>Analytics providers (for website improvement)</li>
                                <li>Cloud hosting providers (for data storage)</li>
                            </ul>
                            <p className="mt-3 text-sm">All service providers are contractually bound to protect your data.</p>

                            <h3 className="text-lg font-medium text-white mt-4 mb-2">4.2 Legal Requirements</h3>
                            <p>We may disclose information if required by law, court order, or government request.</p>

                            <h3 className="text-lg font-medium text-white mt-4 mb-2">4.3 Business Transfers</h3>
                            <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred. We will notify you of any such change.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-cyber-green mb-3 pb-2 border-b border-gray-800">5. International Data Transfers</h2>
                            <p>Your information may be transferred to and processed in countries outside your country of residence, including the United States and United Kingdom.</p>
                            <p className="mt-3">We ensure appropriate safeguards are in place, including Standard Contractual Clauses (SCCs) and adequacy decisions.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-cyber-green mb-3 pb-2 border-b border-gray-800">6. Data Retention</h2>
                            <div className="overflow-x-auto mt-4">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="text-left py-2 px-3 text-cyber-green font-semibold">Data Type</th>
                                            <th className="text-left py-2 px-3 text-cyber-green font-semibold">Retention Period</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-300">
                                        <tr className="border-b border-gray-800"><td className="py-2 px-3">Beta signup information</td><td className="py-2 px-3">Until deletion request, or 3 years if no engagement</td></tr>
                                        <tr className="border-b border-gray-800"><td className="py-2 px-3">Communication records</td><td className="py-2 px-3">3 years from last interaction</td></tr>
                                        <tr className="border-b border-gray-800"><td className="py-2 px-3">Analytics data</td><td className="py-2 px-3">26 months (anonymized thereafter)</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-cyber-green mb-3 pb-2 border-b border-gray-800">7. Your Rights</h2>
                            <h3 className="text-lg font-medium text-white mt-4 mb-2">Under UK GDPR / EU GDPR</h3>
                            <ul className="list-disc list-inside space-y-1">
                                <li><strong className="text-white">Access:</strong> Request a copy of your personal data</li>
                                <li><strong className="text-white">Rectification:</strong> Request correction of inaccurate data</li>
                                <li><strong className="text-white">Erasure:</strong> Request deletion ("right to be forgotten")</li>
                                <li><strong className="text-white">Restriction:</strong> Request limitation of processing</li>
                                <li><strong className="text-white">Portability:</strong> Receive data in machine-readable format</li>
                                <li><strong className="text-white">Objection:</strong> Object to processing based on legitimate interests</li>
                            </ul>

                            <h3 className="text-lg font-medium text-white mt-4 mb-2">Under CCPA (California Residents)</h3>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Right to know what personal information is collected</li>
                                <li>Right to delete personal information</li>
                                <li>Right to opt-out of sale (we do not sell personal information)</li>
                                <li>Right to non-discrimination</li>
                            </ul>

                            <p className="mt-4">To exercise any rights, email us at <a href="mailto:DwayneTillman@7HermeticLabs.Dev" className="text-cyber-green hover:underline">DwayneTillman@7HermeticLabs.Dev</a> with subject "Privacy Rights Request".</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-cyber-green mb-3 pb-2 border-b border-gray-800">8. Data Security</h2>
                            <p>We implement appropriate technical and organizational measures:</p>
                            <ul className="list-disc list-inside mt-3 space-y-1">
                                <li>Encryption in transit (TLS/SSL) and at rest</li>
                                <li>Access controls and authentication</li>
                                <li>Regular security assessments</li>
                                <li>Employee training on data protection</li>
                            </ul>
                            <p className="mt-3 text-sm text-gray-400">While we strive to protect your information, no method is 100% secure.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-cyber-green mb-3 pb-2 border-b border-gray-800">9. Contact Us</h2>
                            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mt-4">
                                <p className="font-semibold text-cyber-green">Hermetic Labs, LLC</p>
                                <p className="mt-2">Email: <a href="mailto:DwayneTillman@7HermeticLabs.Dev" className="text-cyber-green hover:underline">DwayneTillman@7HermeticLabs.Dev</a></p>
                                <p>Website: <a href="https://7hermeticlabs.com" className="text-cyber-green hover:underline">7hermeticlabs.com</a></p>
                            </div>
                            <p className="mt-4 text-sm">For EU/UK inquiries, you may also contact the Information Commissioner's Office (ICO): <a href="https://ico.org.uk" className="text-cyber-green hover:underline">ico.org.uk</a></p>
                        </section>

                        <p className="text-sm text-gray-500 italic border-t border-gray-800 pt-6">
                            This Privacy Policy is provided for informational purposes and should be reviewed by legal counsel before implementation.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
