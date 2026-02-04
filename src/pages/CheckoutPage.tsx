import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/utils';
import { createBulkCheckoutSession } from '../api/exchange';

export function CheckoutPage() {
  const { cartItems, removeFromCart, cartTotal, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setProcessing(true);
    setError(null);

    try {
      // Create bulk checkout with all cart items
      const items = cartItems.map(item => ({
        priceId: item.product.stripePriceId!,
        slug: item.product.slug,
        title: item.product.title,
      }));

      await createBulkCheckoutSession(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-cyber-green text-glow-green mb-8">
          Checkout
        </h1>

        {cartItems.length === 0 ? (
          // Empty cart state
          <div className="cyber-card p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-400 mb-6">
              Browse our marketplace to find modules and add-ons for your projects.
            </p>
            <Link to="/" className="cyber-btn inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>
        ) : (
          // Cart with items
          <div className="space-y-6">
            {/* Cart Items */}
            <div className="cyber-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Cart Items ({cartItems.length})
              </h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-lg"
                  >
                    {/* Product Image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-cyber-bg shrink-0">
                      {item.product.media?.[0] ? (
                        <img
                          src={item.product.media[0].url}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <ShoppingCart className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.product.slug}`}
                        className="text-white font-medium hover:text-cyber-green transition-colors truncate block"
                      >
                        {item.product.title}
                      </Link>
                      <p className="text-sm text-gray-500">
                        by {item.product.author?.name || 'Unknown'}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      {item.product.discountPrice ? (
                        <div>
                          <span className="text-cyber-green font-bold">
                            {formatPrice(item.product.discountPrice)}
                          </span>
                          <span className="text-gray-500 text-sm line-through ml-2">
                            {formatPrice(item.product.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-cyber-green font-bold">
                          {formatPrice(item.product.price)}
                        </span>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-gray-500 hover:text-cyber-pink transition-colors"
                      title="Remove from cart"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="cyber-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Order Summary
              </h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal ({cartItems.length} items)</span>
                  <span className="text-gray-300">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mb-6">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-gray-400">Total</span>
                  <span className="text-cyber-green font-bold">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={processing || cartItems.length === 0}
                className="cyber-btn w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  'Proceed to Payment'
                )}
              </button>
              <p className="text-xs text-gray-500 text-center mt-3">
                Secure checkout powered by Stripe
              </p>
            </div>

            {/* Back to shopping */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-cyber-green transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
