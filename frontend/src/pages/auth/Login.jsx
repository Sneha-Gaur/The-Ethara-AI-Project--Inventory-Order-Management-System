import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import Layout from '../../components/Layout';
import AuthCard from '../../components/AuthCard';
import Alert from '../../components/Alert';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../utils/apiError';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!identifier.trim() || !password) {
      setError('Enter your username or email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(identifier.trim(), password);
      setSuccess('Signed in! Redirecting…');
      setTimeout(() => navigate(from, { replace: true }), 400);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid username/email or password.'));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Layout hideFooter>
        <LoadingSpinner fullScreen />
      </Layout>
    );
  }

  return (
    <Layout hideFooter>
      <AuthCard title="Sign in" subtitle="Use your username or email and password">
        <Alert type="success" message={success} />
        <Alert message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="identifier" className="mb-1 block text-sm font-medium">
              Username or email
            </label>
            <div className="relative">
              <FiUser className="pointer-events-none absolute left-3 top-3 text-slate-400" />
              <input
                id="identifier"
                type="text"
                autoComplete="username"
                placeholder="username or you@email.com"
                className="input-field pl-10"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
            <div className="relative">
              <FiLock className="pointer-events-none absolute left-3 top-3 text-slate-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Your password"
                className="input-field pl-10 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-slate-400"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="text-right text-sm">
            <Link to="/forgot-password" className="text-primary-600 hover:underline">Forgot password?</Link>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          New user?{' '}
          <Link to="/signup" className="font-semibold text-primary-600 hover:underline">Create account</Link>
        </p>
      </AuthCard>
    </Layout>
  );
}
