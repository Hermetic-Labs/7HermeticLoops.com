import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyCertificate, Certificate } from '../api/certificates';
import { Loader2, Award, CheckCircle, XCircle, Printer, ExternalLink, Download } from 'lucide-react';

export function CertificatePage() {
  const { certId } = useParams<{ certId: string }>();
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    async function loadCert() {
      if (!certId) return;
      try {
        const result = await verifyCertificate(certId);
        setCert(result);
        setValid(result.valid);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Certificate not found');
      } finally {
        setLoading(false);
      }
    }
    loadCert();
  }, [certId]);

  const handlePrint = () => window.print();

  const handleLinkedIn = () => {
    if (!cert) return;
    const params = new URLSearchParams({
      name: cert.courseName,
      organizationName: 'Hermetic Labs',
      issueYear: new Date(cert.issuedAt).getFullYear().toString(),
      issueMonth: (new Date(cert.issuedAt).getMonth() + 1).toString(),
      certUrl: cert.verificationUrl,
      certId: cert.certId,
    });
    window.open(`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&${params.toString()}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-cyber-green animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="cyber-panel p-12 max-w-md text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Certificate Not Found</h1>
          <p className="text-gray-400 mb-6">
            {error || 'This certificate could not be verified. It may have been revoked or does not exist.'}
          </p>
          <Link to="/" className="cyber-btn">Return to Exchange</Link>
        </div>
      </div>
    );
  }

  const issuedDate = new Date(cert.issuedAt);
  const formattedDate = issuedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen pt-20 pb-12">
      {/* Print/Share Actions — hidden in print */}
      <div className="max-w-4xl mx-auto px-4 mb-6 print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {valid ? (
              <span className="flex items-center gap-1 text-green-400 text-sm font-medium">
                <CheckCircle className="w-4 h-4" /> Verified Certificate
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-400 text-sm font-medium">
                <XCircle className="w-4 h-4" /> Unverified
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleLinkedIn}
              className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium bg-[#0077B5]/20 text-[#0077B5] hover:bg-[#0077B5]/30 border border-[#0077B5]/30 transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> Add to LinkedIn
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-colors"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>
        </div>
      </div>

      {/* Certificate Display */}
      <div className="max-w-4xl mx-auto px-4">
        <div
          className="relative bg-gradient-to-br from-[#0a0f1a] via-[#0d1525] to-[#0a0f1a] border-2 border-cyber-green/40 rounded-lg overflow-hidden"
          style={{ aspectRatio: '1.414 / 1' }}
        >
          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-cyber-green/60 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-cyber-green/60 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-cyber-green/60 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-cyber-green/60 rounded-br-lg" />

          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(0,255,153,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,153,0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 md:p-12 text-center">
            {/* Logo & Issuer */}
            <div className="flex items-center gap-3 mb-6">
              <img
                src={`${import.meta.env.BASE_URL}images/Hermetci Labs Exchange Logo.png`}
                alt="Hermetic Labs"
                className="w-12 h-12 object-contain"
              />
              <div className="text-left">
                <div className="text-cyber-green font-bold text-lg tracking-wider uppercase">Hermetic Labs</div>
                <div className="text-gray-500 text-xs tracking-widest uppercase">Certificate of Completion</div>
              </div>
            </div>

            {/* Decorative line */}
            <div className="w-48 h-px bg-gradient-to-r from-transparent via-cyber-green/50 to-transparent mb-8" />

            {/* Award icon */}
            <Award className="w-14 h-14 text-cyber-green mb-4 opacity-80" />

            {/* "This certifies that" */}
            <p className="text-gray-400 text-sm tracking-wide mb-3 uppercase">This certifies that</p>

            {/* Recipient Name */}
            <h1
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
            >
              {cert.recipientName}
            </h1>

            {/* "has successfully completed" */}
            <p className="text-gray-400 text-sm tracking-wide mb-3 uppercase">has successfully completed</p>

            {/* Course Name */}
            <h2 className="text-xl md:text-2xl font-semibold text-cyber-green mb-4">
              {cert.courseName}
            </h2>

            {/* Description */}
            <p className="text-gray-400 text-sm max-w-lg mb-6 leading-relaxed">
              {cert.description}
            </p>

            {/* Skills */}
            {cert.skills.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {cert.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 text-xs font-medium text-cyber-green/80 bg-cyber-green/10 border border-cyber-green/20 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {/* Decorative line */}
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-cyber-green/40 to-transparent mb-6" />

            {/* Date & Certificate ID */}
            <div className="flex items-center gap-8 text-xs text-gray-500">
              <div>
                <div className="uppercase tracking-wider mb-1">Issued</div>
                <div className="text-gray-300 font-medium">{formattedDate}</div>
              </div>
              <div>
                <div className="uppercase tracking-wider mb-1">Certificate ID</div>
                <div className="text-gray-300 font-mono font-medium">{cert.certId}</div>
              </div>
              <div>
                <div className="uppercase tracking-wider mb-1">Issuer</div>
                <div className="text-gray-300 font-medium">{cert.issuer}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Info — below certificate, hidden in print */}
      <div className="max-w-4xl mx-auto px-4 mt-6 print:hidden">
        <div className="cyber-panel p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              <span className="text-gray-500">Verification URL:</span>{' '}
              <code className="text-cyber-green/70 text-xs">{cert.verificationUrl}</code>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(cert.verificationUrl)}
              className="text-xs text-gray-400 hover:text-cyber-green transition-colors px-3 py-1 border border-white/10 rounded"
            >
              Copy Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
