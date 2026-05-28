import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { fetchProductBySlug } from '../api/catalog';
import { createCheckoutSession } from '../api/checkout';
import { fetchReviews, markReviewHelpful, ReviewsResponse } from '../api/reviews';
import { fetchQuestions, submitQuestion, Question, QuestionsResponse } from '../api/questions';
import { isAuthenticated } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { Product, Domain, DOMAIN_LABELS } from '../types';
import { MediaCarousel } from '../components/MediaCarousel';
import { StarRating } from '../components/StarRating';
import { formatPrice } from '../lib/utils';
import {
  handlePackageDownload,
  handlePackageInstall,
  shouldUseParentCommunication,
  isPackageInVault,
  isPackageInstalled,
  subscribeToVaultStatus,
  VaultPackage
} from '../lib/download-handler';
import { useWishlist } from '../context/WishlistContext';
import {
  ShoppingCart,
  Heart,
  ExternalLink,
  MessageCircle,
  ThumbsUp,
  User,
  Calendar,
  Loader2,
  Download,
  Flag,
  BadgeCheck,
  Check,
  Users,
  LogIn,
  Rocket,
  FileText,
} from 'lucide-react';
import { ReviewForm } from '../components/ReviewForm';

export function ProductPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'qa' | 'reviews'>('description');
  const [newQuestion, setNewQuestion] = useState('');
  const [reviewsData, setReviewsData] = useState<ReviewsResponse | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [helpfulIds, setHelpfulIds] = useState<Set<string>>(new Set());
  const [questionsData, setQuestionsData] = useState<QuestionsResponse | null>(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const [vaultStatus, setVaultStatus] = useState<VaultPackage[]>([]);
  const [gettingPackage, setGettingPackage] = useState(false);
  const [installing, setInstalling] = useState(false);
  const { addToWishlist, isInWishlist } = useWishlist();

  // Subscribe to vault status updates from parent app
  useEffect(() => {
    if (!shouldUseParentCommunication()) return;
    const unsubscribe = subscribeToVaultStatus((packages) => {
      setVaultStatus(packages);
      // Reset loading states when vault status updates
      setGettingPackage(false);
      setInstalling(false);
    });
    return unsubscribe;
  }, []);

  // Check vault status for current product
  const inVault = slug ? vaultStatus.some(p => p.id === slug) : false;
  const installed = slug ? vaultStatus.find(p => p.id === slug)?.installed ?? false : false;

  const loadReviews = useCallback(async () => {
    if (!slug) return;
    setReviewsLoading(true);
    try {
      const data = await fetchReviews(slug);
      setReviewsData(data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  }, [slug]);

  const loadQuestions = useCallback(async () => {
    if (!slug) return;
    setQuestionsLoading(true);
    try {
      const data = await fetchQuestions(slug);
      setQuestionsData(data);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setQuestionsLoading(false);
    }
  }, [slug]);

  const handleSubmitQuestion = async () => {
    if (!slug || !newQuestion.trim()) return;
    if (!isAuthenticated()) {
      setQuestionError('Please sign in to ask a question');
      return;
    }
    setSubmittingQuestion(true);
    setQuestionError(null);
    try {
      await submitQuestion(slug, newQuestion.trim());
      setNewQuestion('');
      loadQuestions();
    } catch (err) {
      setQuestionError(err instanceof Error ? err.message : 'Failed to submit question');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    if (helpfulIds.has(reviewId)) return;
    try {
      await markReviewHelpful(reviewId);
      setHelpfulIds(prev => new Set(prev).add(reviewId));
      loadReviews(); // Refresh reviews
    } catch (err) {
      console.error('Failed to mark helpful:', err);
    }
  };

  const handlePurchase = async () => {
    if (!product) return;

    setPurchasing(true);
    setPurchaseError(null);

    try {
      await createCheckoutSession(product);
    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : 'Purchase failed');
      setPurchasing(false);
    }
  };

  const handleAddToWishlist = () => {
    if (!product) return;
    addToWishlist(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await fetchProductBySlug(slug);
        setProduct(data || null);
      } catch (err) {
        console.error('Failed to load product:', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  // Load reviews and questions eagerly so tab counts are visible immediately
  useEffect(() => {
    if (slug && !reviewsData) {
      loadReviews();
    }
  }, [slug, reviewsData, loadReviews]);

  useEffect(() => {
    if (slug && !questionsData) {
      loadQuestions();
    }
  }, [slug, questionsData, loadQuestions]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-cyber-green animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Product Not Found</h1>
          <Link to="/" className="cyber-btn">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="py-4 text-sm text-gray-500">
          <Link to="/" className="hover:text-cyber-green">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link to={`/?domain=${product.domain || ''}`} className="hover:text-cyber-green">
            {product.domain ? DOMAIN_LABELS[product.domain as Domain] || product.category : product.category}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-300">{product.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Media Carousel */}
            <MediaCarousel media={product.media} />

            {/* Title & Price (Mobile) */}
            <div className="lg:hidden">
              <h1 className="text-2xl font-bold text-white mb-2">{product.title}</h1>
              <div className="flex items-center gap-4 mb-4">
                <StarRating rating={product.rating} />
                <span className="text-gray-500">({product.reviewCount} reviews)</span>
              </div>
              {product.price > 0 && (
                <div className="flex items-center gap-4">
                  {product.discountPrice ? (
                    <>
                      <span className="text-3xl font-bold text-cyber-green">
                        {formatPrice(product.discountPrice)}
                      </span>
                      <span className="text-xl text-gray-500 line-through">{formatPrice(product.price)}</span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-cyber-green">{formatPrice(product.price)}</span>
                  )}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="border-b border-white/10">
              <div className="flex gap-6">
                {[
                  { key: 'description', label: 'Description' },
                  { key: 'qa', label: 'Q&A' },
                  { key: 'reviews', label: 'Reviews' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={`pb-3 text-sm font-medium transition-colors ${activeTab === tab.key
                      ? 'text-cyber-green border-b-2 border-cyber-green'
                      : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
              {activeTab === 'description' && (
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 whitespace-pre-line">{product.description}</p>
                  {/* README Link */}
                  <div className="mt-8">
                    <h3 className="section-title mb-4">Links & Resources</h3>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        to={`/product/${slug}/readme`}
                        className="cyber-btn-outline flex items-center gap-2 text-sm"
                      >
                        <FileText className="w-3 h-3" />
                        README
                      </Link>
                      {product.links.filter(l => l.url !== '#').map((link, i) => (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cyber-btn-outline flex items-center gap-2 text-sm"
                        >
                          {link.label}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'qa' && (
                <div className="space-y-6">
                  {/* Ask Question */}
                  <div className="cyber-panel p-4">
                    <h4 className="text-sm font-medium text-white mb-3">Ask a Question</h4>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Type your question..."
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmitQuestion()}
                        className="cyber-input flex-1"
                      />
                      <button
                        onClick={handleSubmitQuestion}
                        disabled={submittingQuestion || !newQuestion.trim()}
                        className="cyber-btn flex items-center gap-2 disabled:opacity-50"
                      >
                        {submittingQuestion ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                        ) : (
                          'Submit'
                        )}
                      </button>
                    </div>
                    {questionError && (
                      <div className="mt-2 p-2 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
                        {questionError}
                      </div>
                    )}
                  </div>

                  {/* Questions List */}
                  {questionsLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-6 h-6 text-cyber-green animate-spin mx-auto" />
                    </div>
                  ) : (questionsData?.questions ?? product.questions).length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No questions yet. Be the first to ask!
                    </div>
                  ) : (
                    (questionsData?.questions ?? product.questions).map((q) => (
                      <div key={q.id} className="cyber-card p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-cyber-cyan/20 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-cyber-cyan" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-white">{q.user}</span>
                              <span className="text-xs text-gray-500">{q.date}</span>
                            </div>
                            <p className="text-gray-300 mb-3">{q.question}</p>
                            {q.answer && (
                              <div className="pl-4 border-l-2 border-cyber-green/50">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs text-cyber-green font-medium">
                                    SELLER RESPONSE
                                  </span>
                                </div>
                                <p className="text-gray-400 text-sm">{q.answer}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Rating Summary */}
                  <div className="cyber-panel p-6">
                    <div className="flex flex-wrap items-center gap-8">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-white mb-2">
                          {reviewsData?.summary.averageRating || product.rating}
                        </div>
                        <StarRating rating={reviewsData?.summary.averageRating || product.rating} size="lg" showValue={false} />
                        <div className="text-sm text-gray-500 mt-1">
                          {reviewsData?.summary.totalReviews || product.reviewCount} reviews
                        </div>
                      </div>

                      {/* Rating Distribution */}
                      {reviewsData?.summary && (
                        <div className="flex-1 min-w-[200px] space-y-1">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const count = reviewsData.summary.ratingDistribution[star as 1 | 2 | 3 | 4 | 5];
                            const total = reviewsData.summary.totalReviews || 1;
                            const pct = Math.round((count / total) * 100);
                            return (
                              <div key={star} className="flex items-center gap-2 text-xs">
                                <span className="w-8 text-gray-400">{star}★</span>
                                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-cyber-green"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="w-8 text-gray-500">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="mt-6">
                      <ReviewForm packageSlug={slug!} onReviewSubmitted={loadReviews} />
                    </div>
                  </div>

                  {/* Reviews List */}
                  {reviewsLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-6 h-6 text-cyber-green animate-spin mx-auto" />
                    </div>
                  ) : reviewsData?.reviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No reviews yet. Be the first to review!</div>
                  ) : (
                    reviewsData?.reviews.map((review) => (
                      <div key={review.id} className="cyber-card p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-white">{review.userName}</span>
                              {review.verified && (
                                <span className="flex items-center gap-1 text-xs text-cyber-green">
                                  <BadgeCheck className="w-3 h-3" /> Verified Purchase
                                </span>
                              )}
                              <StarRating rating={review.rating} size="sm" showValue={false} />
                            </div>
                            <h4 className="text-cyber-green font-medium">{review.title}</h4>
                          </div>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{review.content}</p>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleHelpful(review.id)}
                            disabled={helpfulIds.has(review.id)}
                            className={`flex items-center gap-2 text-xs transition-colors ${helpfulIds.has(review.id)
                              ? 'text-cyber-cyan'
                              : 'text-gray-500 hover:text-cyber-cyan'
                              }`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            Helpful ({review.helpful})
                          </button>
                          <button className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-400 transition-colors">
                            <Flag className="w-3 h-3" /> Report
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - sticky container for both panels */}
          <div className="sticky top-24 space-y-6">
            {/* Purchase Panel */}
            <div className="cyber-panel p-6">
              <h1 className="text-xl font-bold text-white mb-2 hidden lg:block">{product.title}</h1>
              <div className="hidden lg:flex items-center gap-4 mb-4">
                <StarRating rating={product.rating} />
                <span className="text-gray-500 text-sm">({product.reviewCount})</span>
              </div>

              {product.price > 0 && (
                <div className="hidden lg:block mb-6">
                  {product.discountPrice ? (
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-cyber-green">
                        {formatPrice(product.discountPrice)}
                      </span>
                      <span className="text-lg text-gray-500 line-through">{formatPrice(product.price)}</span>
                      <span className="px-2 py-1 bg-cyber-pink/20 text-cyber-pink text-xs font-bold rounded">
                        {Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                        OFF
                      </span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-cyber-green">{formatPrice(product.price)}</span>
                  )}
                </div>
              )}
              {/* Closed Beta Notice */}
              <div className="mb-4 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
                <Rocket className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-400">
                  <span className="text-amber-400 font-medium">Closed Beta</span> — This module is currently in closed beta. Request access to be notified when it becomes available.
                </p>
              </div>

              <div className="flex gap-3 mb-6">
                {product.price === 0 && shouldUseParentCommunication() ? (
                  /* Dev mode: Show status-aware button */
                  installed ? (
                    /* Already installed - show status */
                    <button
                      disabled
                      className="cyber-btn flex-1 flex items-center justify-center gap-2 opacity-75 cursor-default"
                    >
                      <Check className="w-4 h-4 text-green-400" />
                      Installed
                    </button>
                  ) : inVault ? (
                    /* In vault but not installed - show Install */
                    <button
                      onClick={() => {
                        setInstalling(true);
                        handlePackageInstall(
                          product.slug,
                          product.title,
                          product.downloadUrl,
                          { author: product.author?.name, version: product.techSpecs?.find(s => s.label === 'Version')?.value }
                        );
                        setTimeout(() => setInstalling(false), 3000);
                      }}
                      disabled={installing}
                      className="cyber-btn flex-1 flex items-center justify-center gap-2 disabled:opacity-75"
                    >
                      {installing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Installing...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Install
                        </>
                      )}
                    </button>
                  ) : (
                    /* Not in vault — auth-aware wishlist */
                    !user ? (
                      <Link
                        to={`/auth?redirect=/product/${slug}`}
                        className="cyber-btn flex-1 flex items-center justify-center gap-2"
                      >
                        <LogIn className="w-4 h-4" /> Sign In
                      </Link>
                    ) : isInWishlist(product.id) ? (
                      <Link
                        to="/wishlist"
                        className="cyber-btn flex-1 flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" /> Added to Wishlist
                      </Link>
                    ) : (
                      <button
                        onClick={handleAddToWishlist}
                        disabled={justAdded}
                        className="cyber-btn flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {justAdded ? (
                          <>
                            <Check className="w-4 h-4" /> Added to Wishlist
                          </>
                        ) : (
                          <>
                            <Heart className="w-4 h-4" /> Add to Wishlist
                          </>
                        )}
                      </button>
                    )
                  )
                ) : (
                  /* Production: auth-aware wishlist for all items */
                  !user ? (
                    <Link
                      to={`/auth?redirect=/product/${slug}`}
                      className="cyber-btn flex-1 flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-4 h-4" /> Sign In
                    </Link>
                  ) : isInWishlist(product.id) ? (
                    <Link
                      to="/wishlist"
                      className="cyber-btn flex-1 flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Added to Wishlist
                    </Link>
                  ) : (
                    <button
                      onClick={handleAddToWishlist}
                      disabled={justAdded}
                      className="cyber-btn flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {justAdded ? (
                        <>
                          <Check className="w-4 h-4" /> Added to Wishlist
                        </>
                      ) : (
                        <>
                          <Heart className="w-4 h-4" /> Add to Wishlist
                        </>
                      )}
                    </button>
                  )
                )}
                {/* Request Beta Access */}
                {!user ? (
                  <Link
                    to={`/auth?redirect=/product/${slug}&intent=beta`}
                    className="cyber-btn-outline p-3 flex items-center gap-2 text-sm"
                    title="Request Beta Access"
                  >
                    <Rocket className="w-5 h-5" />
                    <span className="hidden xl:inline">Request Beta Access</span>
                  </Link>
                ) : isInWishlist(product.id) ? (
                  <button
                    disabled
                    className="cyber-btn-outline p-3 flex items-center gap-2 text-sm opacity-75 cursor-default"
                    title="Beta Requested"
                  >
                    <Check className="w-5 h-5 text-green-400" />
                    <span className="hidden xl:inline">Beta Requested</span>
                  </button>
                ) : (
                  <button
                    onClick={handleAddToWishlist}
                    className="cyber-btn-outline p-3 flex items-center gap-2 text-sm"
                    title="Request Beta Access"
                  >
                    <Rocket className="w-5 h-5" />
                    <span className="hidden xl:inline">Request Beta Access</span>
                  </button>
                )}
              </div>
              {purchaseError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
                  {purchaseError}
                </div>
              )}

              {/* Tech Specs */}
              <div className="border-t border-white/10 pt-4">
                <h3 className="section-title mb-3">Technical Details</h3>
                <div className="space-y-2">
                  {product.techSpecs.map((spec, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-500">{spec.label}</span>
                      <span className="text-gray-300">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Author Card */}
            <Link to={`/author/${product.author.id}`} className="cyber-card p-4 block group">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-black border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {product.author.avatar ? (
                    <img src={`${import.meta.env.BASE_URL}${product.author.avatar}`} alt={product.author.name} className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-white font-bold text-lg">
                      {product.author.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-white group-hover:text-cyber-green transition-colors">
                    {product.author.name}
                  </h4>
                  <p className="text-sm text-gray-500">{product.author.productCount} products</p>
                </div>
              </div>
            </Link>

            {/* Community */}
            {product.communityUrl && (
              <a
                href={product.communityUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cyber-card p-4 flex items-center gap-3 group hover:border-[#1877F2]/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#1877F2]/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#1877F2]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white group-hover:text-[#1877F2] transition-colors text-sm">
                    Join Community
                  </h4>
                  <p className="text-xs text-gray-500">Discuss, remix, get support</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-[#1877F2] transition-colors" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
