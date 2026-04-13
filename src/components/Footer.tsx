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

                    {/* Ecosystem Links */}
                    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm">
                        <a href="https://7hermeticlabs.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-cyber-green transition-colors">
                            Hermetic Labs
                        </a>
                        <a href="https://7hermeticlabs.health" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-cyber-green transition-colors">
                            HALT — Field Triage
                        </a>
                        <a href="https://7hermeticlaws.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-cyber-green transition-colors">
                            The Laws
                        </a>
                        <a href="https://github.com/Hermetic-Labs" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-cyber-green transition-colors">
                            GitHub
                        </a>
                        <a href="mailto:FrontDesk@7hermeticlabs.com" className="text-gray-400 hover:text-cyber-green transition-colors">
                            Contact
                        </a>
                        <Link to="/terms" className="text-gray-400 hover:text-cyber-green transition-colors">
                            Terms
                        </Link>
                        <Link to="/privacy" className="text-gray-400 hover:text-cyber-green transition-colors">
                            Privacy
                        </Link>
                        <Link to="/cookies" className="text-gray-400 hover:text-cyber-green transition-colors">
                            Cookies
                        </Link>
                        <Link to="/evenomics" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                            Evenomics
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
