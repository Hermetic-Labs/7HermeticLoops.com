import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { Heart, ArrowLeft, Rocket, Mail, Building2, User, Briefcase, MessageSquare, CheckCircle, Trash2, Package } from 'lucide-react';
import { useState } from 'react';
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Build request with wishlist items as line items
        const request = {
            ...formData,
            interestedModules: wishlistItems.map(item => ({
                id: item.product.id,
                title: item.product.title,
                slug: item.product.slug,
                category: item.product.category,
            })),
            submittedAt: new Date().toISOString(),
        };

        // In production, this would call an API to store the signup
        console.log('Beta signup request:', request);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        setSubmitted(true);
        setLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="min-h-screen pt-20 pb-12">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Rocket className="w-6 h-6 text-cyber-green" />
                            Join Eve OS Closed Beta
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Get early access to the complete codebase
                        </p>
                    </div>
                </div>

                {/* Wishlist Items - Show above form if any */}
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
                    /* Success State */
                    <div className="cyber-panel p-12 text-center">
                        <CheckCircle className="w-16 h-16 text-cyber-green mx-auto mb-4" />
                        <h2 className="text-xl text-white mb-2">You're on the list!</h2>
                        <p className="text-gray-400 mb-2">
                            We'll review your application and reach out at:
                        </p>
                        <p className="text-cyber-cyan font-medium mb-4">{formData.email}</p>
                        {wishlistItems.length > 0 && (
                            <p className="text-gray-500 text-sm mb-4">
                                <Package className="w-4 h-4 inline mr-1" />
                                {wishlistItems.length} module{wishlistItems.length > 1 ? 's' : ''} noted in your request
                            </p>
                        )}
                        <p className="text-gray-500 text-sm">
                            Beta invites are sent in waves. Priority is given to qualified applicants.
                        </p>
                    </div>
                ) : (
                    <div className="cyber-panel p-8">
                        {/* Intro */}
                        <div className="mb-8 text-center">
                            <h2 className="text-lg text-white mb-2">Eve OS Early Access</h2>
                            <p className="text-gray-400 text-sm">
                                Request access to download the full Eve OS codebase and join our closed beta channel.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">
                                    <Mail className="w-4 h-4 inline mr-1.5" />
                                    Email Address *
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

                            {/* Full Name */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">
                                    <User className="w-4 h-4 inline mr-1.5" />
                                    Full Name *
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

                            {/* Company */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">
                                    <Building2 className="w-4 h-4 inline mr-1.5" />
                                    Company / Organization
                                </label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    placeholder="Company name (or Independent)"
                                    className="cyber-input w-full"
                                />
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">
                                    <Briefcase className="w-4 h-4 inline mr-1.5" />
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

                            {/* Use Case */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">
                                    <MessageSquare className="w-4 h-4 inline mr-1.5" />
                                    What will you build? *
                                </label>
                                <textarea
                                    name="useCase"
                                    value={formData.useCase}
                                    onChange={handleChange}
                                    placeholder="Briefly describe your intended use case or project..."
                                    className="cyber-input w-full h-24 resize-none"
                                    required
                                />
                            </div>

                            {/* Referral Source */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">
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

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="cyber-btn w-full flex items-center justify-center gap-2 py-3"
                            >
                                {loading ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <Rocket className="w-4 h-4" />
                                        Request Beta Access
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-gray-600 text-center">
                                By submitting, you agree to be contacted about Eve OS beta access.
                            </p>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
