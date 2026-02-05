import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { Link } from 'react-router-dom';
import { resolveAssetUrl } from '../lib/utils';
import { Product, Domain, ALL_DOMAINS, DOMAIN_LABELS, CLASS_COLORS, DOMAIN_COLORS, DOMAIN_BG_COLORS, CATEGORY_COLORS } from '../types';

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
  // Dynamic fallback video - fetched from manifest at runtime
  const [manifestVideo, setManifestVideo] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch the fallback video from manifest.json
  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL || '/';
    fetch(`${baseUrl}Videos/manifest.json`)
      .then(res => res.json())
      .then((data) => {
        // Use the first announcement video as the fallback
        const firstVideo = data.announcements?.find((a: { mediaType: string }) => a.mediaType === 'video');
        if (firstVideo?.src) {
          // Normalize the path
          const videoSrc = firstVideo.src.startsWith('/')
            ? `${baseUrl.replace(/\/$/, '')}${firstVideo.src}`
            : firstVideo.src;
          setManifestVideo(videoSrc);
        }
      })
      .catch(err => console.log('Could not load video manifest:', err));
  }, []);

  const videoForTopProducts = fallbackVideoUrl || manifestVideo;

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

    // Group products by category and sort by reviewCount within each
    const productsByCategory: Record<string, Product[]> = {};
    for (const product of products) {
      const category = product.category || 'Other';
      if (!productsByCategory[category]) {
        productsByCategory[category] = [];
      }
      productsByCategory[category].push(product);
    }

    // Sort products within each category by popularity
    for (const category of Object.keys(productsByCategory)) {
      productsByCategory[category].sort((a, b) => b.reviewCount - a.reviewCount);
    }

    // Add slides: one product per category (top by review count)
    for (const category of Object.keys(productsByCategory)) {
      const categoryProducts = productsByCategory[category];
      if (!categoryProducts || categoryProducts.length === 0) continue;

      // One product per category
      const top = categoryProducts[0];
      result.push({
        type: 'product',
        product: top,
        rank: 'runner-up', // Use runner-up rank so it shows as image, not video
      });
    }

    return result;
  }, [products, announcements]);

  // Auto-advance DISABLED - button navigation only
  // Users can manually navigate using prev/next buttons

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
    // Video ended - do NOT auto-advance, just let it loop or stop
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => { });
    }
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

  // Calculate visible slide indices (prev, current, next) with wrapping
  const getVisibleIndices = () => {
    const len = slides.length;
    if (len === 1) return [0];
    if (len === 2) return [(current - 1 + len) % len, current];
    return [
      (current - 1 + len) % len,
      current,
      (current + 1) % len,
    ];
  };

  const visibleIndices = getVisibleIndices();

  // Get transform style based on position relative to current
  const getSlidePosition = (index: number): 'prev' | 'current' | 'next' | 'hidden' => {
    const len = slides.length;
    const prevIndex = (current - 1 + len) % len;
    const nextIndex = (current + 1) % len;
    if (index === current) return 'current';
    if (index === prevIndex) return 'prev';
    if (index === nextIndex) return 'next';
    return 'hidden';
  };

  const getSlideTransform = (index: number): React.CSSProperties => {
    const position = getSlidePosition(index);
    if (position === 'current') {
      return {
        transform: 'translateX(0) scale(1)',
        zIndex: 10,
        opacity: 1,
      };
    } else if (position === 'prev') {
      return {
        transform: 'translateX(-60%) scale(0.75)',
        zIndex: 1,
        opacity: 0.6,
      };
    } else if (position === 'next') {
      return {
        transform: 'translateX(60%) scale(0.75)',
        zIndex: 1,
        opacity: 0.6,
      };
    }
    return {
      display: 'none',
    };
  };

  // Render a single slide
  const renderSlide = (slide: Slide, index: number) => {
    const isActive = index === current;
    const transformStyle = getSlideTransform(index);
    const slidePosition = getSlidePosition(index);

    if (slide.type === 'announcement') {
      const isVideo = slide.mediaType === 'video';
      const showVideo = isVideo && !videoError;

      return (
        <div
          key={slide.id}
          className="absolute inset-0 transition-all duration-500 ease-out"
          style={transformStyle}
        >
          <div className="w-full h-full rounded-lg overflow-hidden shadow-2xl">
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
                    className="w-full h-full object-contain bg-black/90"
                  />
                ) : null}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            {(slide.title || slide.tagline) && (
              <div className="absolute top-6 left-6 md:left-12">
                <div className="max-w-xl">
                  {slide.title && (
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-2 text-glow-green">
                      {slide.title}
                    </h2>
                  )}
                  {slide.tagline && (
                    <p className="text-gray-200 text-sm md:text-base">{slide.tagline}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Product slide
    const { product, rank } = slide;
    const classColor = product.class ? CLASS_COLORS[product.class] : '#00b4ff';
    const domainLabel = product.domain ? DOMAIN_LABELS[product.domain] : product.category;

    // For "top" products, show video (use fallback if no product-specific video)
    const productVideo = product.media.find(m => m.type === 'video');
    // Normalize image URL using standard utility
    const rawImageUrl = product.media[0]?.url;
    const productImage = rawImageUrl
      ? resolveAssetUrl(rawImageUrl)
      : `${import.meta.env.BASE_URL}images/connector-placeholder.svg`;

    // Top products always get video treatment - use product video if available, else fallback
    const videoUrl = productVideo?.url
      ? resolveAssetUrl(productVideo.url) // Ensure video URL is also resolved
      : (rank === 'top' ? videoForTopProducts : null);

    const showProductVideo = rank === 'top' && videoUrl && !videoError;

    return (
      <div
        key={`${product.id}-${rank}`}
        className="absolute inset-0 transition-all duration-500 ease-out"
        style={transformStyle}
      >
        <div className={`w-full h-full rounded-lg overflow-hidden shadow-2xl bg-black/90 ${slidePosition === 'current' ? 'ring-1 ring-cyber-green/60' : ''}`}>
          {/* Image/Video */}
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
              className="w-full h-full object-contain bg-black/90 pb-16"
            />
          )}

          {/* Fade overlay for side slides */}
          {slidePosition === 'prev' && (
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent pointer-events-none" />
          )}
          {slidePosition === 'next' && (
            <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-transparent to-transparent pointer-events-none" />
          )}

          {/* Top Left: Badges (overlay) */}
          <div className="absolute top-4 left-4 md:left-6 flex items-center gap-2 z-10">
            <span
              className="px-2 py-0.5 text-xs font-bold rounded border backdrop-blur-sm"
              style={{
                color: CATEGORY_COLORS[product.category] || '#00b4ff',
                backgroundColor: `${CATEGORY_COLORS[product.category] || '#00b4ff'}30`,
                borderColor: `${CATEGORY_COLORS[product.category] || '#00b4ff'}60`,
              }}
            >
              {product.category}
            </span>
            {product.class && (
              <span
                className="px-2 py-0.5 text-xs font-bold rounded border backdrop-blur-sm"
                style={{
                  color: classColor,
                  backgroundColor: `${classColor}30`,
                  borderColor: `${classColor}60`,
                }}
              >
                {product.class}
              </span>
            )}
          </div>

          {/* Bottom: Full-width description bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm px-4 md:px-6 py-3 flex items-center justify-between gap-4 border-t border-cyber-green/50">
            <p className="text-gray-200 text-sm flex-1 line-clamp-2">
              {product.description}
            </p>
            <Link to={`/product/${product.slug}`} className="cyber-btn text-sm px-4 py-2 shrink-0">
              View Details
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      {/* Carousel container - Frameless floating 3D */}
      <div
        ref={containerRef}
        className={`relative w-full max-w-full overflow-hidden ${isFullscreen
          ? 'h-screen'
          : 'aspect-[2/1] min-h-[300px] max-h-[50vh]'
          }`}
        style={{ perspective: '1000px' }}
      >
        {/* Slides wrapper - centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="relative w-[70%] h-[85%]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {slides.map((slide, index) => {
              // Only render visible slides (prev, current, next)
              if (!visibleIndices.includes(index)) return null;
              return renderSlide(slide, index);
            })}

            {/* Video Controls: Mute/Unmute + Fullscreen - Inside slides wrapper */}
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
          </div>
        </div>

      </div>

      {/* Navigation row with dots and prev/next buttons */}
      {slides.length > 1 && (
        <div className="flex justify-center items-center gap-4 py-3">
          <button
            onClick={prev}
            className="p-2 bg-black/60 rounded-full backdrop-blur hover:bg-black/80 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <div className="flex gap-2">
            {slides.map((slide, index) => {
              const isAnnouncement = slide.type === 'announcement';
              const isVideo = isAnnouncement && (slide as AnnouncementSlide).mediaType === 'video';
              const isTop = slide.type === 'product' && (slide as ProductSlide).rank === 'top';

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
                  className={`h-2 rounded-full transition-all ${index === current
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

          <button
            onClick={next}
            className="p-2 bg-black/60 rounded-full backdrop-blur hover:bg-black/80 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}
