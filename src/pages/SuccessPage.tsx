import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyPurchase, verifyBulkPurchase } from '../api/exchange';
import { useCart } from '../context/CartContext';
import { CheckCircle, Download, Loader2, AlertCircle, Package } from 'lucide-react';

interface DownloadItem {
  packageSlug: string;
  downloadUrl: string;
}

export function SuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const slug = searchParams.get('slug'); // Single item
  const slugs = searchParams.get('slugs'); // Multiple items (comma-separated)

  const { clearCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>([]);
  const [expiresIn, setExpiresIn] = useState<number>(0);

  useEffect(() => {
    async function verify() {
      if (!sessionId) {
        setError('Invalid session');
        setLoading(false);
        return;
      }

      try {
        // Check if this is a bulk purchase (has slugs param)
        if (slugs) {
          const result = await verifyBulkPurchase(sessionId);
          setDownloadItems(result.items);
          setExpiresIn(result.expiresIn);
        } else {
          // Single item purchase - use existing verify endpoint
          const result = await verifyPurchase(sessionId);
          setDownloadItems([{
            packageSlug: result.packageSlug,
            downloadUrl: result.downloadUrl,
          }]);
          setExpiresIn(result.expiresIn);
        }

        // Clear the cart after successful verification
        clearCart();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to verify purchase');
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [sessionId, slugs, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyber-green animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Verifying your purchase...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="cyber-panel p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <p className="text-sm text-gray-500 mb-6">
            If you completed payment, please check your email for download instructions,
            or contact support.
          </p>
          <Link to="/" className="cyber-btn">
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const isBulkPurchase = downloadItems.length > 1;

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4">
      <div className="cyber-panel p-8 max-w-lg w-full text-center">
        <CheckCircle className="w-16 h-16 text-cyber-green mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Purchase Complete!</h1>
        <p className="text-gray-400 mb-6">
          Thank you for your purchase. {isBulkPurchase ? 'Your downloads are ready.' : 'Your download is ready.'}
        </p>

        {/* Download Buttons */}
        {downloadItems.length > 0 && (
          <div className={`${isBulkPurchase ? 'space-y-3 mb-6' : 'mb-4'}`}>
            {downloadItems.map((item, index) => (
              <div key={item.packageSlug} className={isBulkPurchase ? 'cyber-card p-4' : ''}>
                {isBulkPurchase && (
                  <div className="flex items-center gap-2 mb-3 text-left">
                    <Package className="w-4 h-4 text-cyber-cyan" />
                    <span className="text-sm text-gray-300 font-medium">
                      {item.packageSlug}
                    </span>
                  </div>
                )}
                <a
                  href={item.downloadUrl}
                  className={`cyber-btn flex items-center justify-center gap-2 ${isBulkPurchase ? 'w-full' : ''}`}
                  download
                >
                  <Download className="w-5 h-5" />
                  {isBulkPurchase ? 'Download' : 'Download Now'}
                </a>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-500 mb-6">
          Download {isBulkPurchase ? 'links expire' : 'link expires'} in {Math.round(expiresIn / 60)} minutes.
          <br />
          You can also access your purchases from your library.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/" className="cyber-btn-outline">
            Continue Shopping
          </Link>
          <Link to="/library" className="cyber-btn-outline">
            My Library
          </Link>
          {!isBulkPurchase && slug && (
            <Link to={`/product/${slug}`} className="cyber-btn-outline">
              View Product
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
