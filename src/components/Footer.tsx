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
                        <a href="https://www.facebook.com/profile.php?id=61576571498614" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#1877F2] transition-colors" title="Facebook">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </a>
                        <a href="https://www.instagram.com/7hermeticloops" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#E4405F] transition-colors" title="Instagram">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
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
