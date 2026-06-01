import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiUsers, FiShoppingCart, FiAlertTriangle } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import { reportsAPI, inventoryAPI } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([reportsAPI.summary(), inventoryAPI.lowStock()])
      .then(([rep, inv]) => {
        setStats(rep.data);
        setLowStock(inv.data.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const cards = [
    { label: 'Products', value: stats?.total_products, icon: FiPackage, to: '/products', color: 'bg-blue-500' },
    { label: 'Customers', value: stats?.total_customers, icon: FiUsers, to: '/customers', color: 'bg-green-500' },
    { label: 'Orders', value: stats?.total_orders, icon: FiShoppingCart, to: '/orders', color: 'bg-purple-500' },
    { label: 'Revenue', value: `$${Number(stats?.total_revenue || 0).toLocaleString()}`, icon: FiShoppingCart, to: '/reports', color: 'bg-amber-500' },
  ];

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="mt-2 text-slate-600">Overview of your inventory and orders</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="card flex items-center gap-4 transition hover:shadow-md">
            <div className={`rounded-xl p-3 text-white ${c.color}`}>
              <c.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">{c.label}</p>
              <p className="text-2xl font-bold">{c.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Low Stock Alerts</h2>
            <FiAlertTriangle className="text-amber-500" />
          </div>
          {lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">All products are well stocked.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {lowStock.map((p) => (
                <li key={p.id} className="flex justify-between rounded-lg bg-amber-50 px-3 py-2 text-sm">
                  <span>{p.name}</span>
                  <span className="font-medium text-amber-700">{p.quantity} left</span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/inventory" className="mt-4 inline-block text-sm text-primary-600 hover:underline">
            View inventory →
          </Link>
        </div>
        <div className="card">
          <h2 className="font-semibold">Quick Actions</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              ['/products/new', 'Add Product'],
              ['/customers/new', 'Add Customer'],
              ['/orders/new', 'Create Order'],
              ['/reports', 'View Reports'],
            ].map(([to, label]) => (
              <Link key={to} to={to} className="btn-secondary text-center text-sm">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
