import { NavLink, Outlet } from 'react-router-dom';
import {
  FiGrid,
  FiPackage,
  FiUsers,
  FiShoppingCart,
  FiLayers,
  FiBarChart2,
  FiUser,
  FiSettings,
} from 'react-icons/fi';
import Layout from './Layout';

const sidebarLinks = [
  { to: '/dashboard', icon: FiGrid, label: 'Dashboard' },
  { to: '/products', icon: FiPackage, label: 'Products' },
  { to: '/customers', icon: FiUsers, label: 'Customers' },
  { to: '/orders', icon: FiShoppingCart, label: 'Orders' },
  { to: '/inventory', icon: FiLayers, label: 'Inventory' },
  { to: '/reports', icon: FiBarChart2, label: 'Reports' },
  { to: '/profile', icon: FiUser, label: 'Profile' },
  { to: '/settings', icon: FiSettings, label: 'Settings' },
];

export default function DashboardLayout() {
  return (
    <Layout>
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav className="sticky top-24 space-y-1">
            {sidebarLinks.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </Layout>
  );
}
