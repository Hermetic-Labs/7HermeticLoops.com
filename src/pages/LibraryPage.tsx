import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { fetchLibrary, getPackageDownload, LibraryItem } from '../api/library';
import { fetchProductBySlug } from '../api/catalog';
import { Product } from '../types';
import { Loader2, Download, Package, Calendar, AlertCircle, Heart, ShoppingCart, Check, Sparkles } from 'lucide-react';

interface LibraryItemWithProduct extends LibraryItem {
  product?: Product;
  downloading?: boolean;
}

export function LibraryPage() {
  const { user, loading: authLoading } = useAuth();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const [items, setItems] = useState<LibraryItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLibrary() {
      if (!user) return;

      try {
        const libraryItems = await fetchLibrary();

        // Enrich with product details
        const enrichedItems = await Promise.all(
          libraryItems.map(async (item) => {
            const product = await fetchProductBySlug(item.packageSlug);
            return { ...item, product };
          })
        );

        setItems(enrichedItems);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load library');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadLibrary();
    }
  }, [user]);

  const handleDownload = async (item: LibraryItemWithProduct) => {
    setItems((prev) =>
      prev.map((i) =>
        i.packageSlug === item.packageSlug ? { ...i, downloading: true } : i
      )
    );

    try {
      const { downloadUrl } = await getPackageDownload(item.packageSlug);
      window.open(downloadUrl, '_blank');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setItems((prev) =>
        prev.map((i) =>
          i.packageSlug === item.packageSlug ? { ...i, downloading: false } : i
        )
      );
    }
  };

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/auth?redirect=/library" replace />;
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-cyber-green animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="cyber-panel p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Error</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="cyber-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const hasContent = items.length > 0 || wishlistItems.length > 0;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-2">My Library</h1>
        <p className="text-gray-400 mb-8">Your purchases, downloads, and saved items</p>

        {!hasContent ? (
          /* ─── Empty State ─── */
          <div className="cyber-panel p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-cyber-green/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-cyber-green" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Your Library is Empty</h2>
            <p className="text-gray-400 mb-2 max-w-md mx-auto">
              Discover powerful modules for healthcare, finance, AI, and more.
              Add items to your wishlist or purchase packages to see them here.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              Free modules are also tracked here after download.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/" className="cyber-btn">
                Browse Store
              </Link>
              <Link to="/wishlist" className="cyber-btn-outline flex items-center gap-2">
                <Heart className="w-4 h-4" /> View Wishlist
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* ─── Purchased Items ─── */}
            {items.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-cyber-green" />
                  <h2 className="text-lg font-semibold text-white">Purchased ({items.length})</h2>
                </div>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.packageSlug}
                      className="cyber-card p-4 flex items-center gap-4"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-cyber-bg rounded overflow-hidden shrink-0">
                        {item.product?.media[0]?.url ? (
                          <img
                            src={item.product.media[0].url}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-600" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.packageSlug}`}
                          className="text-lg font-medium text-white hover:text-cyber-green transition-colors"
                        >
                          {item.product?.title || item.packageSlug}
                        </Link>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.purchasedAt).toLocaleDateString()}
                          </span>
                          {item.product?.author && (
                            <span>by {item.product.author.name}</span>
                          )}
                        </div>
                      </div>

                      {/* Download Button */}
                      <button
                        onClick={() => handleDownload(item)}
                        disabled={item.downloading}
                        className="cyber-btn flex items-center gap-2 shrink-0"
                      >
                        {item.downloading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Preparing...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            Download
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ─── Wishlist Items ─── */}
            {wishlistItems.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-pink-400" />
                  <h2 className="text-lg font-semibold text-white">Wishlist ({wishlistItems.length})</h2>
                </div>
                <div className="space-y-3">
                  {wishlistItems.map(({ product, addedAt }) => {
                    const inCart = isInCart(product.id);
                    const price = product.discountPrice ?? product.price;

                    return (
                      <div
                        key={product.id}
                        className="cyber-card p-4 flex items-center gap-4"
                      >
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-cyber-bg rounded overflow-hidden shrink-0">
                          {product.media[0]?.url ? (
                            <img
                              src={product.media[0].url}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-600" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/product/${product.slug}`}
                            className="text-base font-medium text-white hover:text-cyber-green transition-colors"
                          >
                            {product.title}
                          </Link>
                          <div className="flex items-center gap-3 mt-1 text-sm">
                            <span className="text-cyber-green font-semibold">
                              {price === 0 ? 'Closed Beta' : `$${price.toFixed(2)}`}
                            </span>
                            {product.author && (
                              <span className="text-gray-500">by {product.author.name}</span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {price > 0 ? (
                            <button
                              onClick={() => {
                                if (!inCart) addToCart(product);
                              }}
                              disabled={inCart}
                              className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors ${
                                inCart
                                  ? 'bg-cyber-green/20 text-cyber-green cursor-default'
                                  : 'bg-cyber-green/10 text-cyber-green hover:bg-cyber-green/20 border border-cyber-green/30'
                              }`}
                            >
                              {inCart ? (
                                <>
                                  <Check className="w-4 h-4" /> In Cart
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                                </>
                              )}
                            </button>
                          ) : (
                            <Link
                              to="/wishlist"
                              className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium bg-cyber-green/10 text-cyber-green hover:bg-cyber-green/20 border border-cyber-green/30 transition-colors"
                            >
                              <Heart className="w-4 h-4" /> Request
                            </Link>
                          )}
                          <button
                            onClick={() => removeFromWishlist(product.id)}
                            className="p-2 text-gray-500 hover:text-pink-400 transition-colors"
                            title="Remove from wishlist"
                          >
                            <Heart className="w-4 h-4 fill-current" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
