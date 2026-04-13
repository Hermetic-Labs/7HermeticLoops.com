import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { verifyEmail } from '../api/exchange';
import { Loader2, AlertCircle, CheckCircle2, Mail, Eye, EyeOff } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { PublicClientApplication } from '@azure/msal-browser';

function PasswordStrength({ password }: { password: string }) {
  const getStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  if (!password) return null;
  const score = getStrength(password);
  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = ['#ff4466', '#ff8844', '#ddaa44', '#44cc66', '#00ff99'];
  const label = labels[Math.min(score, 4)];
  const color = colors[Math.min(score, 4)];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              background: i < score ? color : 'rgba(255,255,255,0.1)',
            }}
          />
        ))}
      </div>
      <span className="text-xs" style={{ color }}>{label}</span>
    </div>
  );
}

export function AuthPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [twoFARequired, setTwoFARequired] = useState(false);
  const [twoFATempToken, setTwoFATempToken] = useState('');
  const [twoFACode, setTwoFACode] = useState('');

  const { login, loginGoogle, loginMicrosoft, complete2FA, register } = useAuth();
  const navigate = useNavigate();

  // MSAL instance for Microsoft sign-in
  const handleMicrosoftLogin = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const msalInstance = new PublicClientApplication({
        auth: {
          clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '17a0f6b6-4285-4272-af72-3bbbd2937973',
          authority: 'https://login.microsoftonline.com/common',
          redirectUri: window.location.origin,
        },
      });
      await msalInstance.initialize();

      const result = await msalInstance.loginPopup({
        scopes: ['openid', 'profile', 'email'],
      });

      if (result.idToken) {
        await loginMicrosoft(result.idToken);
        navigate(redirectTo);
      }
    } catch (err) {
      if ((err as { errorCode?: string })?.errorCode === 'user_cancelled') {
        // User closed the popup — not an error
        return;
      }
      setError(err instanceof Error ? err.message : 'Microsoft authentication failed');
    } finally {
      setLoading(false);
    }
  }, [loginMicrosoft, navigate, redirectTo]);

  useEffect(() => {
    const verifyToken = searchParams.get('verifyToken');
    const verifyEmailParam = searchParams.get('email');
    if (verifyToken && verifyEmailParam) {
      setLoading(true);
      verifyEmail(verifyEmailParam, verifyToken)
        .then(() => {
          // Completely verified and logged in, redirect to the dashboard
          window.location.href = '/';
        })
        .catch(err => {
          setError(err instanceof Error ? err.message : 'Link expired or invalid.');
          setLoading(false);
        });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (twoFARequired) {
      if (!twoFACode) {
        setError('Please enter your 2FA code');
        return;
      }
      setLoading(true);
      try {
        await complete2FA(twoFATempToken, twoFACode);
        navigate(redirectTo);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid 2FA code');
        setLoading(false);
      }
      return;
    }

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await login(email, password);
        if (result.requires2FA && result.tempToken) {
          setTwoFARequired(true);
          setTwoFATempToken(result.tempToken);
          setLoading(false);
          return;
        }
        navigate(redirectTo);
      } else {
        await register(email, password, displayName || undefined);
        setRegisteredEmail(email);
        setRegistrationSuccess(true);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setDisplayName('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Registration success state — show verification instructions
  if (registrationSuccess) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <div className="cyber-panel p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-cyber-green/20 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-cyber-green" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Check Your Email</h1>
          <p className="text-gray-400 mb-4">
            We've sent a verification link to
          </p>
          <p className="text-cyber-green font-medium text-lg mb-6">{registeredEmail}</p>
          <p className="text-gray-500 text-sm mb-8">
            Click the link in your email to verify your account. Once verified, you'll be signed in automatically.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setRegistrationSuccess(false);
                setMode('login');
              }}
              className="cyber-btn w-full"
            >
              Back to Sign In
            </button>
            <Link to="/" className="block text-sm text-gray-500 hover:text-gray-400 transition-colors">
              Continue browsing as guest
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2FA code entry screen
  if (twoFARequired) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <div className="cyber-panel p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-cyber-green/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-cyber-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Two-Factor Authentication</h1>
          <p className="text-gray-400 mb-6">
            Enter the 6-digit code from your authenticator app
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              inputMode="numeric"
              maxLength={8}
              value={twoFACode}
              onChange={(e) => setTwoFACode(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
              className="cyber-input w-full text-center text-2xl tracking-[0.5em] font-mono"
              placeholder="000000"
              autoFocus
              autoComplete="one-time-code"
            />
            <button
              type="submit"
              disabled={loading || twoFACode.length < 6}
              className="cyber-btn w-full"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Verify'}
            </button>
          </form>

          <p className="text-gray-600 text-xs mt-4">
            You can also enter a backup code
          </p>

          <button
            onClick={() => {
              setTwoFARequired(false);
              setTwoFACode('');
              setTwoFATempToken('');
              setError(null);
            }}
            className="text-sm text-gray-500 hover:text-gray-400 transition-colors mt-4"
          >
            ← Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4">
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'UNSET_GOOGLE_CLIENT_ID'}>
      <div className="cyber-panel p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-gray-400 text-center mb-6">
          {mode === 'login'
            ? 'Sign in to access your library'
            : 'Join to purchase and manage packages'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="mb-6 space-y-3">
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                if (credentialResponse.credential) {
                  try {
                    setLoading(true);
                    await loginGoogle(credentialResponse.credential);
                    navigate(redirectTo);
                  } catch(err) {
                    setError(err instanceof Error ? err.message : 'Google authentication failed');
                    setLoading(false);
                  }
                }
              }}
              onError={() => {
                setError('Google login popup failed to initialize');
              }}
              useOneTap
              shape="rectangular"
              theme="filled_black"
            />
          </div>
          <button
            type="button"
            onClick={handleMicrosoftLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded border border-gray-700 bg-[#111] hover:bg-[#1a1a1a] hover:border-gray-600 transition-all text-sm text-gray-200 font-medium disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="9" height="9" fill="#f25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
              <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
            </svg>
            Sign in with Microsoft
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#0a0a0a] text-gray-500">or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Display Name <span className="text-gray-600">(optional)</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="cyber-input w-full"
                autoComplete="name"
                placeholder="Your name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="cyber-input w-full"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="cyber-input w-full pr-10"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {mode === 'register' && <PasswordStrength password={password} />}
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="cyber-input w-full pr-10"
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
                {confirmPassword && password === confirmPassword && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-green" />
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="cyber-btn w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : mode === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          {mode === 'login' ? (
            <p className="text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={() => { setMode('register'); setError(null); }}
                className="text-cyber-green hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-gray-400">
              Already have an account?{' '}
              <button
                onClick={() => { setMode('login'); setError(null); }}
                className="text-cyber-green hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-400">
            Continue as guest
          </Link>
        </div>
      </div>
    </GoogleOAuthProvider>
    </div>
  );
}
