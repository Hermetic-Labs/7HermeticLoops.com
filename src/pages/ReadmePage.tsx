import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, FileText, Loader2, AlertCircle } from 'lucide-react';

export function ReadmePage() {
  const { slug } = useParams();
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReadme() {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}packages/${slug}/README.md`);
        if (!res.ok) {
          throw new Error(res.status === 404 ? 'README not found' : `Failed to load (${res.status})`);
        }
        const text = await res.text();
        // Guard against HTML 404 pages being served
        if (text.trim().startsWith('<!') || text.trim().startsWith('<html')) {
          throw new Error('README not found');
        }
        setContent(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load README');
      } finally {
        setLoading(false);
      }
    }
    loadReadme();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-cyber-green animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading README...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="py-4 text-sm text-gray-500 flex items-center gap-2">
          <Link to="/" className="hover:text-cyber-green">Home</Link>
          <span>/</span>
          <Link to={`/product/${slug}`} className="hover:text-cyber-green">{slug}</Link>
          <span>/</span>
          <span className="text-gray-300">README</span>
        </nav>

        {/* Back link */}
        <Link
          to={`/product/${slug}`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-cyber-green transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to product
        </Link>

        {error ? (
          <div className="cyber-panel p-8 text-center">
            <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-4 opacity-60" />
            <h2 className="text-lg font-medium text-white mb-2">README Not Available</h2>
            <p className="text-gray-500 text-sm mb-6">
              This package doesn't have a README yet. Check the product page for details.
            </p>
            <Link
              to={`/product/${slug}`}
              className="cyber-btn inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Product
            </Link>
          </div>
        ) : (
          <div className="cyber-panel p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <FileText className="w-5 h-5 text-cyber-green" />
              <h1 className="text-lg font-semibold text-white">README.md</h1>
            </div>

            {/* Markdown content */}
            <div className="readme-content prose prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-white mt-8 mb-4 first:mt-0 pb-2 border-b border-white/10">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold text-white mt-6 mb-3 pb-1 border-b border-white/5">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-medium text-white mt-5 mb-2">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-300 mb-4 leading-relaxed">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-gray-300 mb-4 space-y-1 ml-2">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-1 ml-2">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-gray-300">{children}</li>
                  ),
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyber-green hover:underline">
                      {children}
                    </a>
                  ),
                  code: ({ className, children, ...props }) => {
                    const isInline = !className;
                    if (isInline) {
                      return (
                        <code className="bg-white/10 text-cyber-cyan px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code className={`${className || ''} text-sm`} {...props}>
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="bg-black/40 border border-white/10 rounded-lg p-4 mb-4 overflow-x-auto text-sm">
                      {children}
                    </pre>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto mb-4">
                      <table className="w-full border-collapse border border-white/10 text-sm">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-white/5">{children}</thead>
                  ),
                  th: ({ children }) => (
                    <th className="border border-white/10 px-3 py-2 text-left text-gray-300 font-medium">{children}</th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-white/10 px-3 py-2 text-gray-400">{children}</td>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-cyber-green/50 pl-4 my-4 text-gray-400 italic">
                      {children}
                    </blockquote>
                  ),
                  hr: () => <hr className="border-white/10 my-6" />,
                }}
              >
                {content || ''}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
