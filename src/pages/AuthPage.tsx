import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { verifyEmail } from '../api/exchange';
import { Loader2, AlertCircle } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export function AuthPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, loginGoogle, register } = useAuth();
  const navigate = useNavigate();

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
        await login(email, password);
        navigate(redirectTo);
      } else {
        await register(email, password);
        window.alert('Account created successfully! Please check your email inbox to verify your address before logging in.');
        setMode('login');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

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

        <div className="mb-6 flex justify-center w-full">
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

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#0a0a0a] text-gray-500">or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="cyber-input w-full"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder="••••••••"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="cyber-input w-full"
                autoComplete="new-password"
                placeholder="••••••••"
              />
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
                onClick={() => setMode('register')}
                className="text-cyber-green hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-gray-400">
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
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
