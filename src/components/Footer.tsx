import { Link } from 'react-router-dom';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-gray-800 bg-black/50 mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Copyright */}
                    <div className="text-gray-500 text-sm">
                        © {currentYear} Hermetic Labs, LLC. All rights reserved.
                    </div>

                    {/* Legal Links */}
                    <div className="flex items-center gap-6 text-sm">
                        <Link to="/terms" className="text-gray-400 hover:text-cyber-green transition-colors">
                            Terms of Service
                        </Link>
                        <Link to="/privacy" className="text-gray-400 hover:text-cyber-green transition-colors">
                            Privacy Policy
                        </Link>
                        <Link to="/cookies" className="text-gray-400 hover:text-cyber-green transition-colors">
                            Cookies
                        </Link>
                    </div>

                    {/* Contact */}
                    <div className="text-gray-500 text-sm">
                        <a
                            href="mailto:DwayneTillman@7HermeticLabs.Dev"
                            className="hover:text-cyber-green transition-colors"
                        >
                            Contact
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
