import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function CookiePolicyPage() {
    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-3xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyber-green mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <div className="cyber-panel p-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Cookie Policy</h1>
                    <p className="text-gray-400 mb-8">
                        <strong>Hermetic Labs, LLC</strong> · Last Updated: February 2026
                    </p>

                    <div className="legal-content space-y-8 text-gray-300">
                        <section>
                            <h2 className="text-xl font-semibold text-cyber-green mb-3 pb-2 border-b border-gray-800">What Are Cookies?</h2>
                            <p>Cookies are small text files placed on your device when you visit our website. They help us provide you with a better experience and understand how visitors use our site.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-cyber-green mb-3 pb-2 border-b border-gray-800">Cookies We Use</h2>
                            <div className="overflow-x-auto mt-4">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="text-left py-2 px-3 text-cyber-green font-semibold">Category</th>
                                            <th className="text-left py-2 px-3 text-cyber-green font-semibold">Cookie</th>
                                            <th className="text-left py-2 px-3 text-cyber-green font-semibold">Purpose</th>
                                            <th className="text-left py-2 px-3 text-cyber-green font-semibold">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-300">
                                        <tr className="border-b border-gray-800">
                                            <td className="py-2 px-3 font-medium text-white">Essential</td>
                                            <td className="py-2 px-3">Session ID</td>
                                            <td className="py-2 px-3">Required for website functionality</td>
                                            <td className="py-2 px-3">Session</td>
                                        </tr>
                                        <tr className="border-b border-gray-800">
                                            <td className="py-2 px-3 font-medium text-white">Analytics</td>
                                            <td className="py-2 px-3">_ga, _gid</td>
                                            <td className="py-2 px-3">Google Analytics - helps us understand site usage</td>
                                            <td className="py-2 px-3">Up to 2 years</td>
                                        </tr>
                                        <tr className="border-b border-gray-800">
                                            <td className="py-2 px-3 font-medium text-white">Preferences</td>
                                            <td className="py-2 px-3">theme, locale</td>
                                            <td className="py-2 px-3">Remember your display preferences</td>
                                            <td className="py-2 px-3">1 year</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-cyber-green mb-3 pb-2 border-b border-gray-800">Your Choices</h2>
                            <h3 className="text-lg font-medium text-white mt-4 mb-2">Accept or Reject</h3>
                            <p>When you first visit our site, you can choose to accept or reject non-essential cookies.</p>

                            <h3 className="text-lg font-medium text-white mt-4 mb-2">Browser Settings</h3>
                            <p>You can also control cookies through your browser:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li><strong className="text-white">Chrome:</strong> Settings → Privacy and Security → Cookies</li>
                                <li><strong className="text-white">Firefox:</strong> Options → Privacy & Security → Cookies</li>
                                <li><strong className="text-white">Safari:</strong> Preferences → Privacy → Cookies</li>
                                <li><strong className="text-white">Edge:</strong> Settings → Cookies and Site Permissions</li>
                            </ul>

                            <h3 className="text-lg font-medium text-white mt-4 mb-2">Opt-Out Links</h3>
                            <p>Google Analytics: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-cyber-green hover:underline">tools.google.com/dlpage/gaoptout</a></p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-cyber-green mb-3 pb-2 border-b border-gray-800">Impact of Disabling Cookies</h2>
                            <p>Disabling essential cookies may prevent some features from working properly. Disabling analytics cookies will not affect your ability to use the site.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-cyber-green mb-3 pb-2 border-b border-gray-800">Changes to This Policy</h2>
                            <p>We may update this Cookie Policy from time to time. Check the "Last Updated" date for the most recent version.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-cyber-green mb-3 pb-2 border-b border-gray-800">Contact Us</h2>
                            <p>Questions? Email us at <a href="mailto:DwayneTillman@7HermeticLabs.Dev" className="text-cyber-green hover:underline">DwayneTillman@7HermeticLabs.Dev</a></p>
                        </section>

                        <p className="text-sm text-gray-400 border-t border-gray-800 pt-6">
                            For more information about how we handle your data, see our <Link to="/privacy" className="text-cyber-green hover:underline">Privacy Policy</Link>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
