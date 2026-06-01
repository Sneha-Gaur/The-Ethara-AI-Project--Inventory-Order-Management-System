import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiAtSign, FiEye, FiEyeOff } from 'react-icons/fi';
import Layout from '../../components/Layout';
import AuthCard from '../../components/AuthCard';
import Alert from '../../components/Alert';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../utils/apiError';
import { sanitizeUsername } from '../../utils/authValidation';
import api from '../../services/api';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiOk, setApiOk] = useState(null);
  const { signup, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/health/db', { timeout: 5000 }).then(() => setApiOk(true)).catch(() => setApiOk(false));
  }, []);

  useEffect(() => {
    if (!authLoading && user) navigate('/dashboard', { replace: true });
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const em = email.trim().toLowerCase();
    const u = sanitizeUsername(username || em.split('@')[0], em);

    if (!em || !em.includes('@')) {
      setError('Enter a valid email (example: you@gmail.com)');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await signup({ username: u, email: em, password });
      setSuccess('Account created! Redirecting…');
      setTimeout(() => navigate('/dashboard', { replace: true }), 400);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Signup failed. Is the server running? Double-click START_AUTH.bat'));
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
      <AuthCard title="Create account" subtitle="Register with any username, email, and password (6+ characters)">
        {apiOk === false && (
          <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Server not detected. Run <strong>START_AUTH.bat</strong> in the project folder, then refresh this page.
          </div>
        )}
        {apiOk === true && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
            Server connected — you can sign up now.
          </div>
        )}

        <Alert type="success" message={success} />
        <Alert message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium">Username</label>
            <div className="relative">
              <FiAtSign className="pointer-events-none absolute left-3 top-3 text-slate-400" />
              <input
                id="username"
                type="text"
                placeholder="any name you like"
                className="input-field pl-10"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
            <div className="relative">
              <FiMail className="pointer-events-none absolute left-3 top-3 text-slate-400" />
              <input
                id="email"
                type="email"
                placeholder="you@gmail.com"
                className="input-field pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                placeholder="min 6 characters"
                className="input-field pl-10 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button type="button" className="absolute right-3 top-2.5 text-slate-400" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Creating…' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Have an account? <Link to="/login" className="font-semibold text-primary-600 hover:underline">Sign in</Link>
        </p>
      </AuthCard>
    </Layout>
  );
}
