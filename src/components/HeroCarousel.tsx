import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product, Domain, ALL_DOMAINS, DOMAIN_LABELS, CLASS_COLORS } from '../types';

// Announcement slide type (videos/images from /Videos folder)
interface AnnouncementSlide {
  type: 'announcement';
  id: string;
  mediaType: 'video' | 'image';
  src: string;
  title?: string;
  tagline?: string;
}

// Product slide type (from catalog)
interface ProductSlide {
  type: 'product';
  product: Product;
  rank: 'top' | 'runner-up'; // Top gets video treatment, runner-ups get image
}

// Domain divider (optional visual marker)
interface DomainDivider {
  type: 'domain-marker';
  domain: Domain;
}

type Slide = AnnouncementSlide | ProductSlide;

interface Props {
  products: Product[];
  announcements?: Array<{
    id: string;
    mediaType: 'video' | 'image';
    src: string;
    title?: string;
    tagline?: string;
  }>;
  // Fallback video to use for #1 products that don't have their own video
  fallbackVideoUrl?: string;
}

export function HeroCarousel({ products, announcements = [], fallbackVideoUrl }: Props) {
  // Default fallback video - use the main company video for #1 products
  const defaultFallbackVideo = `${import.meta.env.BASE_URL}Videos/Overview%20(5).mp4`;
  const videoForTopProducts = fallbackVideoUrl || defaultFallbackVideo;
  const [current, setCurrent] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.log('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  }, []);

  // Listen for fullscreen changes (e.g., user presses Escape)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Build slides: announcements first, then sequential domain groups
  // Each domain: [Top Video] → [Runner-up 1] → [Runner-up 2]
  const slides: Slide[] = useMemo(() => {
    const result: Slide[] = [];
    const baseUrl = import.meta.env.BASE_URL || '/';

    // Add announcements first (company video, etc.)
    announcements.forEach((a) => {
      result.push({
        type: 'announcement',
        ...a,
        src: a.src.startsWith('/') ? `${baseUrl.replace(/\/$/, '')}${a.src}` : a.src,
      });
    });

    // Group products by domain and sort by reviewCount within each
    const productsByDomain: Record<string, Product[]> = {};
    for (const product of products) {
      const domain = product.domain || 'dev';
      if (!productsByDomain[domain]) {
        productsByDomain[domain] = [];
      }
      productsByDomain[domain].push(product);
    }

    // Sort products within each domain by popularity
    for (const domain of Object.keys(productsByDomain)) {
      productsByDomain[domain].sort((a, b) => b.reviewCount - a.reviewCount);
    }

    // Add slides in domain order: for each populated domain, add top 3
    for (const domain of ALL_DOMAINS) {
      const domainProducts = productsByDomain[domain];
      if (!domainProducts || domainProducts.length === 0) continue;

      // Top product gets "top" treatment (video if available)
      const top = domainProducts[0];
      result.push({
        type: 'product',
        product: top,
        rank: 'top',
      });

      // Next 2 are runner-ups (image cards)
      for (let i = 1; i < Math.min(3, domainProducts.length); i++) {
        result.push({
          type: 'product',
          product: domainProducts[i],
          rank: 'runner-up',
        });
      }
    }

    return result;
  }, [products, announcements]);

  // Auto-advance timer
  useEffect(() => {
    if (slides.length === 0) return;

    const currentSlide = slides[current];

    // Determine if current is a video
    // All announcement videos and all top-ranked products get video treatment (using fallback)
    const isAnnouncementVideo = currentSlide?.type === 'announcement' && currentSlide.mediaType === 'video';
    const isTopProduct = currentSlide?.type === 'product' && currentSlide.rank === 'top';

    const isVideo = isAnnouncementVideo || isTopProduct;

    // Don't auto-advance if current slide is a video (let it play through)
    if (isVideo && !videoError) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length, current, videoError]);

  // Reset video error state and play video when slide changes
  useEffect(() => {
    setVideoError(false);
    const timer = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch((err) => {
          console.log('Video autoplay failed:', err);
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [current]);

  const prev = () => setCurrent((current - 1 + slides.length) % slides.length);
  const next = () => setCurrent((current + 1) % slides.length);

  const handleVideoEnd = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const handleVideoError = () => {
    setVideoError(true);
  };

  if (slides.length === 0) {
    return null;
  }

  // Check if current slide has video
  // All announcement videos and all top-ranked products get video treatment
  const currentSlide = slides[current];
  const isCurrentVideo = currentSlide?.type === 'announcement' && currentSlide.mediaType === 'video';
  const isCurrentTopProduct = currentSlide?.type === 'product' && currentSlide.rank === 'top';

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden cyber-card ${
        isFullscreen
          ? 'h-screen max-h-screen rounded-none'
          : 'aspect-[2/1] max-h-[400px] rounded-lg'
      }`}
    >
      {slides.map((slide, index) => {
        const isActive = index === current;

        if (slide.type === 'announcement') {
          const isVideo = slide.mediaType === 'video';
          const showVideo = isVideo && !videoError;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {showVideo ? (
                <video
                  ref={isActive ? videoRef : null}
                  src={slide.src}
                  className={`w-full h-full ${isFullscreen ? 'object-contain bg-black' : 'object-cover'}`}
                  autoPlay={isActive}
                  muted={isMuted}
                  playsInline
                  onEnded={handleVideoEnd}
                  onError={handleVideoError}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-cyber-bg via-cyber-green/10 to-cyber-cyan/10">
                  {slide.mediaType === 'image' || videoError ? (
                    <img
                      src={videoError ? `${import.meta.env.BASE_URL}images/connector-placeholder.svg` : slide.src}
                      alt={slide.title || 'Announcement'}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {(slide.title || slide.tagline) && (
                <div className="absolute inset-0 flex items-end px-8 md:px-16 pb-16">
                  <div className="max-w-2xl">
                    {slide.title && (
                      <h2 className="text-3xl md:text-5xl font-bold text-white mb-3 text-glow-green">
                        {slide.title}
                      </h2>
                    )}
                    {slide.tagline && (
                      <p className="text-gray-200 text-lg md:text-xl">{slide.tagline}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        }

        // Product slide
        const { product, rank } = slide;
        const classColor = product.class ? CLASS_COLORS[product.class] : '#00b4ff';
        const domainLabel = product.domain ? DOMAIN_LABELS[product.domain] : product.category;

        // For "top" products, show video (use fallback if no product-specific video)
        const productVideo = product.media.find(m => m.type === 'video');
        const productImage = product.media[0]?.url || `${import.meta.env.BASE_URL}images/connector-placeholder.svg`;
        // Top products always get video treatment - use product video if available, else fallback
        const videoUrl = productVideo?.url || (rank === 'top' ? videoForTopProducts : null);
        const showProductVideo = rank === 'top' && videoUrl && !videoError;

        return (
          <div
            key={`${product.id}-${rank}`}
            className={`absolute inset-0 transition-opacity duration-500 ${
              isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {showProductVideo ? (
              <video
                ref={isActive ? videoRef : null}
                src={videoUrl!}
                className={`w-full h-full ${isFullscreen ? 'object-contain bg-black' : 'object-cover'}`}
                autoPlay={isActive}
                muted={isMuted}
                playsInline
                onEnded={handleVideoEnd}
                onError={handleVideoError}
              />
            ) : (
              <img
                src={productImage}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex items-end px-8 md:px-16 pb-16">
              <div className="max-w-lg">
                {/* Rank indicator + Class badge + Domain */}
                <div className="flex items-center gap-3 mb-3">
                  {rank === 'top' && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-cyber-green/20 text-cyber-green border border-cyber-green/40 rounded">
                      #1 in {domainLabel}
                    </span>
                  )}
                  {product.class && (
                    <span
                      className="px-2 py-0.5 text-xs font-bold rounded border"
                      style={{
                        color: classColor,
                        backgroundColor: `${classColor}20`,
                        borderColor: `${classColor}40`,
                      }}
                    >
                      {product.class}
                    </span>
                  )}
                  {rank !== 'top' && (
                    <span className="text-gray-400 text-sm uppercase tracking-wider">
                      {domainLabel}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">
                  {product.title}
                </h2>
                <p className="text-gray-300 mb-4 line-clamp-2">{product.description}</p>
                <Link to={`/product/${product.slug}`} className="cyber-btn inline-block">
                  View Details
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      {/* Video Controls: Mute/Unmute + Fullscreen */}
      {(isCurrentVideo || isCurrentTopProduct) && !videoError && (
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 bg-black/50 rounded backdrop-blur hover:bg-black/70 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-black/50 rounded backdrop-blur hover:bg-black/70 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-5 h-5 text-white" /> : <Maximize className="w-5 h-5 text-white" />}
          </button>
        </div>
      )}

      {/* Navigation */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded backdrop-blur hover:bg-black/70 transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded backdrop-blur hover:bg-black/70 transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* Dots with type/rank indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((slide, index) => {
            const isAnnouncement = slide.type === 'announcement';
            const isVideo = isAnnouncement && (slide as AnnouncementSlide).mediaType === 'video';
            const isTop = slide.type === 'product' && (slide as ProductSlide).rank === 'top';

            // Color coding:
            // - Green: Video (announcement or top product with video)
            // - Cyan: Image announcement
            // - Pink: Top product (non-video)
            // - White/Gray: Runner-up products
            const getColor = () => {
              if (isVideo) return 'bg-cyber-green';
              if (isAnnouncement) return 'bg-cyber-cyan';
              if (isTop) return 'bg-cyber-pink';
              return 'bg-white/70';
            };

            return (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`h-2 rounded-full transition-all ${
                  index === current
                    ? `${getColor()} w-6`
                    : 'bg-white/30 w-2 hover:bg-white/50'
                }`}
                title={
                  isAnnouncement
                    ? 'Announcement'
                    : isTop
                      ? `#1 in ${DOMAIN_LABELS[(slide as ProductSlide).product.domain || 'dev']}`
                      : (slide as ProductSlide).product.title
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
