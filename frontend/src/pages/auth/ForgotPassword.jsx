import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiLock } from 'react-icons/fi';
import Layout from '../../components/Layout';
import AuthCard from '../../components/AuthCard';
import Alert from '../../components/Alert';
import { authAPI } from '../../services/api';
import { getApiErrorMessage, normalizeEmail } from '../../utils/apiError';
import { validateEmail, validatePassword, validateConfirmPassword } from '../../utils/authValidation';

export default function ForgotPassword() {
  const [tab, setTab] = useState('request');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }
    setLoading(true);
    try {
      const { data } = await authAPI.forgotPassword(normalizeEmail(email));
      setMessage(data.message);
      setTab('reset');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Request failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const emailErr = validateEmail(email);
    const passErr = validatePassword(newPassword);
    const confirmErr = validateConfirmPassword(newPassword, confirmPassword);
    if (emailErr || passErr || confirmErr) {
      setError(emailErr || passErr || confirmErr);
      return;
    }
    setLoading(true);
    try {
      const { data } = await authAPI.resetPassword({
        email: normalizeEmail(email),
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setMessage(data.message);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not reset password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout hideFooter>
      <AuthCard
        title="Password help"
        subtitle={tab === 'request' ? 'We will guide you to reset your password' : 'Set a new password for your account'}
      >
        <div className="mb-4 flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setTab('request')}
            className={`flex-1 rounded-md py-2 text-sm font-medium ${tab === 'request' ? 'bg-white shadow text-primary-700' : 'text-slate-600'}`}
          >
            Forgot password
          </button>
          <button
            type="button"
            onClick={() => setTab('reset')}
            className={`flex-1 rounded-md py-2 text-sm font-medium ${tab === 'reset' ? 'bg-white shadow text-primary-700' : 'text-slate-600'}`}
          >
            Reset password
          </button>
        </div>

        <Alert type="success" message={message} />
        <Alert message={error} onClose={() => setError('')} />

        {tab === 'request' ? (
          <form onSubmit={handleRequest} className="space-y-4">
            <div>
              <label htmlFor="forgot-email" className="mb-1 block text-sm font-medium">
                Email address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-slate-400" />
                <input
                  id="forgot-email"
                  type="email"
                  required
                  className="input-field pl-10"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending…' : 'Send reset instructions'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  className="input-field pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">New password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  className="input-field pl-10"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Confirm new password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  className="input-field pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm">
          <Link to="/login" className="font-medium text-primary-600 hover:underline">
            Back to sign in
          </Link>
        </p>
      </AuthCard>
    </Layout>
  );
}
