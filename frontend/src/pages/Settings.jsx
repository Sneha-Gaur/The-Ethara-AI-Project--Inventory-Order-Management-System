import { useState } from 'react';
import Alert from '../components/Alert';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await authAPI.resetPassword({ email: user.email, new_password: password });
      setMessage('Password updated successfully');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Update failed');
    }
  };

  return (
    <div>
      <h1 className="page-title">Settings</h1>
      <div className="card mt-6 max-w-md">
        <h2 className="font-semibold">Change Password</h2>
        <Alert type="success" message={message} />
        <Alert message={error} onClose={() => setError('')} />
        <form onSubmit={handleReset} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">New Password</label>
            <input type="password" required minLength={6} className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary">Update Password</button>
        </form>
      </div>
    </div>
  );
}
