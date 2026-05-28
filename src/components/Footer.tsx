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
                        <a href="https://www.facebook.com/profile.php?id=61590308674784" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#1877F2] transition-colors" title="Facebook">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </a>
                        <a href="https://www.linkedin.com/company/119623995" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#0A66C2] transition-colors" title="LinkedIn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
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
                        <Link to="/certifications" className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                            HIDE Certification
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
