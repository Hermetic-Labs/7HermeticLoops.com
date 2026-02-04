import { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product, Domain, DOMAIN_LABELS, CLASS_COLORS, PackageClass } from '../types';
import { formatPrice } from '../lib/utils';

interface DomainFeatured {
  id: string;
  mediaType: 'video' | 'image';
  src: string;
  title?: string;
  tagline?: string;
}

interface Props {
  domain: Domain;
  products: Product[];
  featured?: DomainFeatured | null;
}

// Slot types for the domain carousel
type SlotType = 'featured' | 'video' | 'product';

interface Slot {
  type: SlotType;
  product?: Product;
  featured?: DomainFeatured;
}

export function DomainCarousel({ domain, products, featured }: Props) {
  const [current, setCurrent] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const baseUrl = import.meta.env.BASE_URL || '/';

  // Sort products by popularity (reviewCount)
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => b.reviewCount - a.reviewCount);
  }, [products]);

  // Build slots:
  // Slot 0: Admin-featured (if exists)
  // Slot 1: Top product video/hero
  // Slots 2-4: Next 2-3 products as cards
  const slots: Slot[] = useMemo(() => {
    const result: Slot[] = [];

    // Slot 0: Admin featured content (optional)
    if (featured) {
      result.push({
        type: 'featured',
        featured: {
          ...featured,
          src: featured.src.startsWith('/') ? `${baseUrl.replace(/\/$/, '')}${featured.src}` : featured.src,
        },
      });
    }

    // Slot 1: Top product as video/hero slide
    if (sortedProducts.length > 0) {
      result.push({ type: 'video', product: sortedProducts[0] });
    }

    // Slots 2-4: Next products as cards (up to 3)
    const remaining = sortedProducts.slice(1, 4);
    remaining.forEach((product) => {
      result.push({ type: 'product', product });
    });

    return result;
  }, [featured, sortedProducts, baseUrl]);

  // Auto-advance timer
  useEffect(() => {
    if (slots.length <= 1) return;

    const currentSlot = slots[current];
    const isVideo =
      currentSlot?.type === 'featured' && currentSlot.featured?.mediaType === 'video';

    // Don't auto-advance during video playback
    if (isVideo && !videoError) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slots.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [slots.length, current, videoError]);

  // Reset video when slide changes
  useEffect(() => {
    setVideoError(false);
    const timer = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [current]);

  const prev = () => setCurrent((current - 1 + slots.length) % slots.length);
  const next = () => setCurrent((current + 1) % slots.length);

  const handleVideoEnd = () => {
    setCurrent((prev) => (prev + 1) % slots.length);
  };

  if (slots.length === 0) return null;

  const domainLabel = DOMAIN_LABELS[domain];

  return (
    <section className="py-6">
      {/* Domain Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-1 h-6 bg-cyber-green rounded-full" />
          {domainLabel}
          <span className="text-sm font-normal text-gray-500">
            ({products.length} package{products.length !== 1 ? 's' : ''})
          </span>
        </h2>
        <Link
          to={`/?domain=${domain}`}
          className="text-cyber-cyan text-sm hover:underline"
        >
          View All
        </Link>
      </div>

      {/* Carousel */}
      <div className="relative aspect-[3/1] max-h-[250px] rounded-lg overflow-hidden cyber-card">
        {slots.map((slot, index) => {
          const isActive = index === current;

          // Featured slot (admin-inserted)
          if (slot.type === 'featured' && slot.featured) {
            const isVideo = slot.featured.mediaType === 'video';
            const showVideo = isVideo && !videoError;

            return (
              <div
                key={`featured-${slot.featured.id}`}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                {showVideo ? (
                  <video
                    ref={isActive ? videoRef : null}
                    src={slot.featured.src}
                    className="w-full h-full object-cover"
                    autoPlay={isActive}
                    muted={isMuted}
                    playsInline
                    onEnded={handleVideoEnd}
                    onError={() => setVideoError(true)}
                  />
                ) : (
                  <img
                    src={slot.featured.src}
                    alt={slot.featured.title || 'Featured'}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                {(slot.featured.title || slot.featured.tagline) && (
                  <div className="absolute bottom-4 left-4">
                    {slot.featured.title && (
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {slot.featured.title}
                      </h3>
                    )}
                    {slot.featured.tagline && (
                      <p className="text-gray-300 text-sm">{slot.featured.tagline}</p>
                    )}
                  </div>
                )}
              </div>
            );
          }

          // Video slot (top product hero)
          if (slot.type === 'video' && slot.product) {
            const product = slot.product;
            const heroImage =
              product.media[0]?.url ||
              `${baseUrl}images/connector-placeholder.svg`;
            const classColor = product.class
              ? CLASS_COLORS[product.class]
              : '#00b4ff';

            return (
              <div
                key={`video-${product.id}`}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <img
                  src={heroImage}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 flex items-center px-6">
                  <div className="max-w-md">
                    {product.class && (
                      <span
                        className="inline-block px-2 py-0.5 text-xs font-bold rounded border mb-2"
                        style={{
                          color: classColor,
                          backgroundColor: `${classColor}20`,
                          borderColor: `${classColor}40`,
                        }}
                      >
                        {product.class}
                      </span>
                    )}
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                      {product.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                      {product.description}
                    </p>
                    <Link
                      to={`/product/${product.slug}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-cyber-green/20 border border-cyber-green/50 text-cyber-green text-sm rounded hover:bg-cyber-green/30 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          }

          // Product card slot
          if (slot.type === 'product' && slot.product) {
            const product = slot.product;
            const heroImage =
              product.media[0]?.url ||
              `${baseUrl}images/connector-placeholder.svg`;
            const classColor = product.class
              ? CLASS_COLORS[product.class]
              : '#00b4ff';

            return (
              <div
                key={`product-${product.id}`}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <div className="w-full h-full flex">
                  {/* Left: Product image */}
                  <div className="w-1/2 h-full relative">
                    <img
                      src={heroImage}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-cyber-bg" />
                  </div>
                  {/* Right: Product info */}
                  <div className="w-1/2 h-full flex flex-col justify-center px-6 bg-cyber-bg">
                    {product.class && (
                      <span
                        className="inline-block w-fit px-2 py-0.5 text-xs font-bold rounded border mb-2"
                        style={{
                          color: classColor,
                          backgroundColor: `${classColor}20`,
                          borderColor: `${classColor}40`,
                        }}
                      >
                        {product.class}
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
                      {product.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-cyber-green font-bold">
                        {formatPrice(product.discountPrice ?? product.price)}
                      </span>
                      <Link
                        to={`/product/${product.slug}`}
                        className="text-cyber-cyan text-sm hover:underline"
                      >
                        Learn More
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return null;
        })}

        {/* Video controls */}
        {slots[current]?.type === 'featured' &&
          slots[current]?.featured?.mediaType === 'video' &&
          !videoError && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="absolute top-2 right-2 p-1.5 bg-black/50 rounded backdrop-blur hover:bg-black/70 transition-colors z-10"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>
          )}

        {/* Navigation */}
        {slots.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-1 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 rounded backdrop-blur hover:bg-black/70 transition-colors z-10"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={next}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 rounded backdrop-blur hover:bg-black/70 transition-colors z-10"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}

        {/* Dots */}
        {slots.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {slots.map((slot, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === current
                    ? slot.type === 'featured'
                      ? 'bg-cyber-green w-4'
                      : slot.type === 'video'
                      ? 'bg-cyber-cyan w-4'
                      : 'bg-cyber-pink w-4'
                    : 'bg-white/50 w-1.5'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
