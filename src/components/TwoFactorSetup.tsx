/**
 * TwoFactorSetup — Embedded component for enabling/configuring TOTP 2FA.
 * Used in the Account/Settings page.
 */

import { useState } from 'react';
import { api2faSetup, api2faConfirm } from '../api/auth';
import { Loader2, Shield, ShieldCheck, Copy, CheckCircle2 } from 'lucide-react';

type SetupStep = 'idle' | 'scanning' | 'confirming' | 'complete';

export function TwoFactorSetup() {
  const [step, setStep] = useState<SetupStep>('idle');
  const [secret, setSecret] = useState('');
  const [otpauthUri, setOtpauthUri] = useState('');
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleStartSetup = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api2faSetup();
      setSecret(result.secret);
      setOtpauthUri(result.otpauthUri);
      setStep('scanning');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!code || code.length < 6) {
      setError('Enter the 6-digit code from your authenticator');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const result = await api2faConfirm(code);
      setBackupCodes(result.backupCodes);
      setStep('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code — try again');
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Idle — offer to enable 2FA
  if (step === 'idle') {
    return (
      <div className="cyber-panel p-6">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Two-Factor Authentication</h3>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Add an extra layer of security using an authenticator app like Google Authenticator, Authy, or 1Password.
        </p>
        {error && (
          <div className="mb-3 p-2 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
            {error}
          </div>
        )}
        <button
          onClick={handleStartSetup}
          disabled={loading}
          className="cyber-btn text-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enable 2FA'}
        </button>
      </div>
    );
  }

  // Scanning — show QR code (text URI for now) and secret
  if (step === 'scanning') {
    return (
      <div className="cyber-panel p-6">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="w-5 h-5 text-cyber-green" />
          <h3 className="text-lg font-semibold text-white">Scan with Authenticator</h3>
        </div>

        <div className="flex flex-col items-center gap-4 my-4">
          {/* QR Code — rendered using a data URI via Canvas */}
          <div id="qr-code-container" className="bg-white p-3 rounded-lg">
            <img
              id="qr-code-img"
              alt="Scan this QR code"
              className="w-48 h-48"
              ref={(img) => {
                if (img && otpauthUri) {
                  // Dynamically generate QR code using canvas
                  import('qrcode').then(QRCode => {
                    QRCode.toDataURL(otpauthUri, { width: 192, margin: 1 })
                      .then((url: string) => { img.src = url; })
                      .catch(() => { /* fallback: user can enter manually */ });
                  }).catch(() => { /* qrcode not installed — manual entry */ });
                }
              }}
            />
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Or enter this secret manually:</p>
            <code className="text-sm text-cyber-green bg-gray-900 px-3 py-1.5 rounded font-mono tracking-wider select-all">
              {secret}
            </code>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm text-gray-400 mb-2">Enter the 6-digit code to confirm:</label>
          {error && (
            <div className="mb-2 p-2 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="cyber-input flex-1 text-center text-xl tracking-[0.3em] font-mono"
              placeholder="000000"
              autoFocus
            />
            <button
              onClick={handleConfirm}
              disabled={loading || code.length < 6}
              className="cyber-btn px-6"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Complete — show backup codes
  return (
    <div className="cyber-panel p-6">
      <div className="flex items-center gap-3 mb-3">
        <ShieldCheck className="w-5 h-5 text-cyber-green" />
        <h3 className="text-lg font-semibold text-white">2FA Enabled ✓</h3>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3 mb-4">
        <p className="text-yellow-400 text-sm font-medium mb-1">⚠ Save your backup codes</p>
        <p className="text-yellow-400/70 text-xs">
          These codes can be used if you lose access to your authenticator. Each code works once. <strong>This is the only time they will be shown.</strong>
        </p>
      </div>

      <div className="bg-gray-900 rounded p-4 mb-4 font-mono text-sm">
        <div className="grid grid-cols-2 gap-2">
          {backupCodes.map((code, i) => (
            <div key={i} className="text-gray-300 text-center py-1">
              {code}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={copyBackupCodes}
        className="cyber-btn text-sm w-full flex items-center justify-center gap-2"
      >
        {copied ? (
          <>
            <CheckCircle2 className="w-4 h-4" /> Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" /> Copy Backup Codes
          </>
        )}
      </button>
    </div>
  );
}
