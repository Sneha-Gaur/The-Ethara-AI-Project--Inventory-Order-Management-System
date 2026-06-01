import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiAtSign, FiShield, FiCalendar, FiLogOut, FiSettings } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (!user) return null;

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  const items = [
    { icon: FiUser, label: 'Full name', value: user.full_name },
    { icon: FiAtSign, label: 'Username', value: `@${user.username}` },
    { icon: FiMail, label: 'Email', value: user.email },
    { icon: FiShield, label: 'Role', value: user.role },
    { icon: FiCalendar, label: 'Member since', value: memberSince },
  ];

  return (
    <div>
      <h1 className="page-title">My Profile</h1>
      <p className="mt-2 text-slate-600">Your account details and session</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="card text-center lg:col-span-1">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-3xl font-bold text-white">
            {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <h2 className="mt-4 text-xl font-semibold">{user.full_name}</h2>
          <p className="text-sm text-slate-500">@{user.username}</p>
          <span className="mt-3 inline-block rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold capitalize text-primary-700">
            {user.role}
          </span>
          <div className="mt-6 flex flex-col gap-2">
            <Link to="/settings" className="btn-secondary inline-flex items-center justify-center gap-2">
              <FiSettings /> Account settings
            </Link>
            <button type="button" onClick={handleLogout} className="btn-danger inline-flex items-center justify-center gap-2">
              <FiLogOut /> Log out
            </button>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-slate-900">Account information</h3>
          <dl className="mt-6 divide-y divide-slate-100">
            {items.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex gap-4 py-4 first:pt-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-primary-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <dt className="text-sm text-slate-500">{label}</dt>
                  <dd className="mt-0.5 font-medium capitalize text-slate-900">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
          <p className="mt-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
            You are signed in. Your session is saved securely in this browser until you log out.
          </p>
        </div>
      </div>
    </div>
  );
}
