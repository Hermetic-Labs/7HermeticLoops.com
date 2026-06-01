import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { Heart, ArrowLeft, Rocket, Mail, Building2, User, Briefcase, MessageSquare, CheckCircle, Trash2, Package } from 'lucide-react';
import { useState, useRef } from 'react';
import { resolveAssetUrl } from '../lib/utils';

interface BetaSignupData {
    email: string;
    fullName: string;
    company: string;
    role: string;
    useCase: string;
    referralSource: string;
}

export function WishlistPage() {
    const { wishlistItems, removeFromWishlist } = useWishlist();
    const [formData, setFormData] = useState<BetaSignupData>({
        email: '',
        fullName: '',
        company: '',
        role: '',
        useCase: '',
        referralSource: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const errorRef = useRef<HTMLDivElement>(null);

    const showError = (msg: string) => {
        setError(msg);
        setTimeout(() => {
            errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.email || !formData.fullName || !formData.company || !formData.useCase) {
            showError('Please fill in all required fields.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            showError('Please enter a valid email address.');
            return;
        }

        setLoading(true);

        const request = {
            ...formData,
            interestedModules: wishlistItems.map(item => ({
                id: item.product.id,
                title: item.product.title,
                slug: item.product.slug,
                category: item.product.domain,
            })),
        };

        try {
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:7071';
            const response = await fetch(`${apiBase}/api/beta/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 409) {
                    showError("This email is already on the list — we'll be in touch soon.");
                } else {
                    showError(data.error || 'Submission failed. Please try again.');
                }
                setLoading(false);
                return;
            }

            setSubmitted(true);
        } catch (err) {
            showError(err instanceof Error ? err.message : 'Network error. Please check your connection and try again.');
            if (import.meta.env.DEV) setSubmitted(true);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // ── WHO QUALIFIES DATA ────────────────────────────────────────
    const qualifiesItems = [
        'Software developers building on Eve OS',
        'Founders evaluating the platform for a product',
        'Enterprise teams with a deployment use case',
        'Researchers and academics studying AI OS ecosystems',
        'Independent builders with a verifiable project',
    ];
    const doesNotQualifyItems = [
        'Requesting access just to browse — no build intent',
        'Anonymous or unverifiable applicants',
        'Commercial redistribution without a signed agreement',
    ];

    return (
        <div className="min-h-screen pt-20 pb-16">
            <div className="max-w-2xl mx-auto px-4">

                {/* ── HEADER ──────────────────────────────────────── */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/" className="text-gray-400 hover:text-white transition-colors flex-shrink-0">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Rocket className="w-6 h-6 text-cyber-green" />
                            Join Eve OS Closed Beta
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Early access to the full Eve OS codebase
                        </p>
                    </div>
                </div>

                {/* ── SAVED MODULES ────────────────────────────────── */}
                {wishlistItems.length > 0 && !submitted && (
                    <div className="cyber-panel p-4 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Heart className="w-4 h-4 text-cyber-pink" />
                            <span className="text-sm text-gray-400">
                                Modules you're interested in ({wishlistItems.length})
                            </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {wishlistItems.map((item) => (
                                <div key={item.product.id} className="relative group">
                                    <Link to={`/product/${item.product.slug}`} className="block">
                                        <div className="aspect-video rounded overflow-hidden bg-gray-800">
                                            {item.product.media[0]?.type === 'video' ? (
                                                <video
                                                    src={resolveAssetUrl(item.product.media[0]?.url)}
                                                    className="w-full h-full object-cover"
                                                    muted
                                                />
                                            ) : (
                                                <img
                                                    src={resolveAssetUrl(item.product.media[0]?.url) || '/images/connector-placeholder.svg'}
                                                    alt={item.product.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-300 mt-1 truncate">{item.product.title}</p>
                                    </Link>
                                    <button
                                        onClick={() => removeFromWishlist(item.product.id)}
                                        className="absolute top-1 right-1 p-1 bg-black/60 rounded opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-400"
                                        title="Remove"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {submitted ? (
                    /* ── SUCCESS STATE ───────────────────────────── */
                    <div className="cyber-panel p-10 text-center">
                        <div className="text-5xl mb-5">🚀</div>
                        <h2 className="text-xl font-bold text-white mb-3">You're on the list.</h2>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto mb-6">
                            We review every application manually and will reach out to{' '}
                            <span className="text-cyber-cyan font-medium">{formData.email}</span>.
                            Expect a response within 5 business days — typically with a brief
                            onboarding call to get you set up correctly from the start.
                        </p>
                        {wishlistItems.length > 0 && (
                            <p className="text-gray-500 text-sm mb-6 flex items-center justify-center gap-1.5">
                                <Package className="w-4 h-4" />
                                {wishlistItems.length} module{wishlistItems.length > 1 ? 's' : ''} noted in your request
                            </p>
                        )}
                        <div className="inline-block border border-cyber-green/30 bg-cyber-green/5 text-cyber-green text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full">
                            Under review · Expect a response within 5 days
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ── WHO QUALIFIES ────────────────────────── */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                            <div className="rounded-lg p-4 border border-cyber-green/20 bg-cyber-green/5">
                                <div className="text-xs font-bold tracking-widest uppercase text-cyber-green mb-3">
                                    ✓ &nbsp;Who This Is For
                                </div>
                                {qualifiesItems.map(item => (
                                    <div key={item} className="flex items-start gap-2 py-1.5 border-b border-white/5 last:border-0 last:pb-0">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyber-green flex-shrink-0" />
                                        <span className="text-sm text-gray-300 leading-snug">{item}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="rounded-lg p-4 border border-red-500/20 bg-red-500/5">
                                <div className="text-xs font-bold tracking-widest uppercase text-red-400 mb-3">
                                    ✗ &nbsp;Not a Fit Right Now
                                </div>
                                {doesNotQualifyItems.map(item => (
                                    <div key={item} className="flex items-start gap-2 py-1.5 border-b border-white/5 last:border-0 last:pb-0">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                                        <span className="text-sm text-gray-400 leading-snug">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── DIVIDER ──────────────────────────────── */}
                        <div className="border-t border-white/5 mb-8" />

                        {/* ── ERROR BANNER ─────────────────────────── */}
                        {error && (
                            <div
                                ref={errorRef}
                                className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm px-4 py-3 mb-6"
                            >
                                <span className="text-base leading-none mt-0.5">⚠</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* ── PART 1: WHO YOU ARE ──────────────── */}
                            <div>
                                <div className="section-title mb-4">01 — Who You Are</div>
                                <div className="cyber-panel p-6 space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2">
                                                <Mail className="w-3 h-3 inline mr-1.5" />
                                                Email <span className="text-cyber-green">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="you@company.com"
                                                className="cyber-input w-full"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2">
                                                <User className="w-3 h-3 inline mr-1.5" />
                                                Full Name <span className="text-cyber-green">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                placeholder="Your full name"
                                                className="cyber-input w-full"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2">
                                                <Building2 className="w-3 h-3 inline mr-1.5" />
                                                Company / Organization <span className="text-cyber-green">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="company"
                                                value={formData.company}
                                                onChange={handleChange}
                                                placeholder="Company or project name"
                                                className="cyber-input w-full"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2">
                                                <Briefcase className="w-3 h-3 inline mr-1.5" />
                                                Role / Title
                                            </label>
                                            <select
                                                name="role"
                                                value={formData.role}
                                                onChange={handleChange}
                                                className="cyber-input w-full"
                                            >
                                                <option value="">Select your role...</option>
                                                <option value="founder">Founder / CEO</option>
                                                <option value="cto">CTO / Technical Lead</option>
                                                <option value="developer">Developer / Engineer</option>
                                                <option value="research">Researcher / Academic</option>
                                                <option value="product">Product Manager</option>
                                                <option value="investor">Investor / VC</option>
                                                <option value="enterprise">Enterprise Buyer</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── PART 2: WHAT YOU'RE BUILDING ─────── */}
                            <div>
                                <div className="section-title mb-4">02 — What You're Building</div>
                                <div className="rounded-lg border border-cyber-green/10 bg-cyber-green/5 px-4 py-3 mb-4">
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        These questions help us get you set up faster — not gatekeep.{' '}
                                        <span className="text-gray-200 font-medium">Answer honestly</span> and we'll
                                        know exactly what to brief you on when we onboard you.
                                    </p>
                                </div>
                                <div className="cyber-panel p-6 space-y-5">
                                    <div>
                                        <label className="block text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2">
                                            <MessageSquare className="w-3 h-3 inline mr-1.5" />
                                            What will you build? <span className="text-cyber-green">*</span>
                                        </label>
                                        <textarea
                                            name="useCase"
                                            value={formData.useCase}
                                            onChange={handleChange}
                                            placeholder="Describe your project or use case — what problem are you solving with Eve OS? What modules caught your eye and why?"
                                            className="cyber-input w-full h-28 resize-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2">
                                            How did you hear about us?
                                        </label>
                                        <select
                                            name="referralSource"
                                            value={formData.referralSource}
                                            onChange={handleChange}
                                            className="cyber-input w-full"
                                        >
                                            <option value="">Select...</option>
                                            <option value="github">GitHub</option>
                                            <option value="twitter">Twitter / X</option>
                                            <option value="linkedin">LinkedIn</option>
                                            <option value="referral">Friend / Colleague</option>
                                            <option value="search">Search Engine</option>
                                            <option value="conference">Conference / Event</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="cyber-btn w-full flex items-center justify-center gap-2 py-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {loading ? (
                                            <>
                                                <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin flex-shrink-0" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Rocket className="w-4 h-4" />
                                                Request Beta Access
                                            </>
                                        )}
                                    </button>
                                    <p className="text-xs text-gray-600 text-center leading-relaxed">
                                        We review every application manually and respond within 5 business days.
                                        <br />
                                        Questions?{' '}
                                        <a href="mailto:FrontDesk@7hermeticlabs.com" className="text-cyber-green/60 hover:text-cyber-green transition-colors">
                                            FrontDesk@7hermeticlabs.com
                                        </a>
                                        {' · '}
                                        <Link to="/terms" className="text-cyber-green/60 hover:text-cyber-green transition-colors">
                                            Terms
                                        </Link>
                                    </p>
                                </div>
                            </div>

                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
