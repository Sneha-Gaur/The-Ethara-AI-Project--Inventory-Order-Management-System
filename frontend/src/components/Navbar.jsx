import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiPackage } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/catalog', label: 'Catalog' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact Us' },
];

const appLinks = [
  { to: '/products', label: 'Products' },
  { to: '/customers', label: 'Customers' },
  { to: '/orders', label: 'Orders' },
  { to: '/inventory', label: 'Inventory' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
    setOpen(false);
  };

  const linkClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium rounded-lg transition ${
      isActive ? 'text-primary-600 bg-primary-50' : 'text-slate-600 hover:text-primary-600 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-primary-700">
          <FiPackage className="h-8 w-8" />
          <span className="text-lg font-bold">Ethara Inventory</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {publicLinks.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === '/'}>
              {l.label}
            </NavLink>
          ))}
          {user &&
            appLinks.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/profile" className={linkClass}>
                @{user.username || user.full_name}
              </NavLink>
              <button type="button" onClick={handleLogout} className="btn-secondary text-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary text-sm">
                Login
              </Link>
              <Link to="/signup" className="btn-primary text-sm">
                Signup
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {[...publicLinks, ...(user ? appLinks : [])].map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)} end={l.to === '/'}>
                {l.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <NavLink to="/dashboard" className={linkClass} onClick={() => setOpen(false)}>
                  Dashboard
                </NavLink>
                <button type="button" onClick={handleLogout} className="btn-secondary mt-2 w-full">
                  Logout
                </button>
              </>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <Link to="/login" className="btn-secondary text-center" onClick={() => setOpen(false)}>
                  Login
                </Link>
                <Link to="/signup" className="btn-primary text-center" onClick={() => setOpen(false)}>
                  Signup
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
