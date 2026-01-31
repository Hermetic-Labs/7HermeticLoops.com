import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

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
}

export function HeroCarousel({ products, announcements = [] }: Props) {
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

  // Build slides array: announcements first, then featured products
  // Prepend BASE_URL to announcement src paths for proper resolution
  const baseUrl = import.meta.env.BASE_URL || '/';
  const slides: Slide[] = [
    ...announcements.map((a): AnnouncementSlide => ({
      type: 'announcement',
      ...a,
      // Ensure src has BASE_URL prefix for proper path resolution
      src: a.src.startsWith('/') ? `${baseUrl.replace(/\/$/, '')}${a.src}` : a.src,
    })),
    ...products.slice(0, 3).map((product): ProductSlide => ({
      type: 'product',
      product,
    })),
  ];

  // Auto-advance timer (longer for videos)
  useEffect(() => {
    if (slides.length === 0) return;

    const currentSlide = slides[current];
    const isVideo = currentSlide?.type === 'announcement' && currentSlide.mediaType === 'video';

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
    // Small delay to ensure the video element is mounted
    const timer = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch((err) => {
          console.log('Video autoplay failed:', err);
          // Autoplay might be blocked by browser, that's ok
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [current]);

  const prev = () => setCurrent((current - 1 + slides.length) % slides.length);
  const next = () => setCurrent((current + 1) % slides.length);

  const handleVideoEnd = () => {
    // Advance to next slide when video ends
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const handleVideoError = () => {
    setVideoError(true);
  };

  if (slides.length === 0) {
    return null;
  }

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
        const { product } = slide;
        const heroImage = product.media[0]?.url || `${import.meta.env.BASE_URL}images/connector-placeholder.svg`;

        return (
          <div
            key={product.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={heroImage}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex items-center px-8 md:px-16">
              <div className="max-w-lg">
                <span className="text-cyber-cyan text-sm uppercase tracking-wider mb-2 block">
                  {product.category}
                </span>
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
      {slides[current]?.type === 'announcement' &&
       (slides[current] as AnnouncementSlide).mediaType === 'video' &&
       !videoError && (
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

      {/* Dots with type indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((slide, index) => {
            const isAnnouncement = slide.type === 'announcement';
            const isVideo = isAnnouncement && (slide as AnnouncementSlide).mediaType === 'video';

            return (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`h-2 rounded-full transition-all ${
                  index === current
                    ? isVideo
                      ? 'bg-cyber-green w-6'
                      : isAnnouncement
                        ? 'bg-cyber-cyan w-6'
                        : 'bg-cyber-pink w-6'
                    : 'bg-white/50 w-2'
                }`}
                title={isAnnouncement ? 'Announcement' : 'Featured Product'}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
