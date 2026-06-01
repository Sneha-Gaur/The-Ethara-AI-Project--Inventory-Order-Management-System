import { useEffect, useState } from 'react';
import { FiAlertTriangle, FiPackage } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import { inventoryAPI } from '../services/api';

export default function Inventory() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inventoryAPI.dashboard().then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  const statCards = [
    { label: 'Total Products', value: data.total_products, icon: FiPackage, color: 'text-blue-600' },
    { label: 'Stock Units', value: data.total_stock_units, icon: FiPackage, color: 'text-green-600' },
    { label: 'Low Stock', value: data.low_stock_count, icon: FiAlertTriangle, color: 'text-amber-600' },
    { label: 'Out of Stock', value: data.out_of_stock_count, icon: FiAlertTriangle, color: 'text-red-600' },
  ];

  return (
    <div>
      <h1 className="page-title">Inventory</h1>
      <p className="mt-2 text-slate-600">Track stock levels and movement history</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="card flex items-center gap-4">
            <s.icon className={`h-8 w-8 ${s.color}`} />
            <div>
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="font-semibold">Stock Levels</h2>
          <div className="mt-4 max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2">Product</th>
                  <th>SKU</th>
                  <th>Qty</th>
                </tr>
              </thead>
              <tbody>
                {data.products.map((p) => (
                  <tr key={p.product_id} className={`border-t ${p.is_low_stock ? 'bg-amber-50' : ''}`}>
                    <td className="py-2">{p.product_name}</td>
                    <td>{p.sku}</td>
                    <td className={p.quantity === 0 ? 'font-bold text-red-600' : p.is_low_stock ? 'text-amber-600' : ''}>
                      {p.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <h2 className="font-semibold">Recent Inventory Logs</h2>
          <ul className="mt-4 max-h-96 space-y-2 overflow-y-auto text-sm">
            {data.recent_logs.map((log) => (
              <li key={log.id} className="rounded-lg border border-slate-100 p-3">
                <div className="flex justify-between font-medium">
                  <span>{log.product_name}</span>
                  <span className={log.change_amount < 0 ? 'text-red-600' : 'text-green-600'}>
                    {log.change_amount > 0 ? '+' : ''}{log.change_amount}
                  </span>
                </div>
                <p className="text-slate-500">{log.reason} — {log.previous_quantity} → {log.new_quantity}</p>
                <p className="text-xs text-slate-400">{new Date(log.created_at).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
