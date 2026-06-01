import { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import LoadingSpinner from '../components/LoadingSpinner';
import { reportsAPI } from '../services/api';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsAPI.summary().then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  const statusChart = {
    labels: Object.keys(data.orders_by_status),
    datasets: [{ data: Object.values(data.orders_by_status), backgroundColor: ['#fbbf24', '#3b82f6', '#22c55e', '#ef4444'] }],
  };

  const revenueChart = {
    labels: data.revenue_by_month.map((m) => m.month),
    datasets: [{ label: 'Revenue ($)', data: data.revenue_by_month.map((m) => m.revenue), backgroundColor: '#6366f1' }],
  };

  return (
    <div>
      <h1 className="page-title">Reports</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Products', data.total_products],
          ['Customers', data.total_customers],
          ['Orders', data.total_orders],
          ['Revenue', `$${Number(data.total_revenue).toLocaleString()}`],
        ].map(([label, val]) => (
          <div key={label} className="card text-center">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-primary-600">{val}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 font-semibold">Orders by Status</h2>
          <Doughnut data={statusChart} />
        </div>
        <div className="card">
          <h2 className="mb-4 font-semibold">Revenue by Month</h2>
          {data.revenue_by_month.length ? <Bar data={revenueChart} options={{ responsive: true }} /> : <p className="text-slate-500">No completed orders yet</p>}
        </div>
      </div>
      <div className="card mt-8">
        <h2 className="font-semibold">Low Stock Products</h2>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2">Name</th>
              <th>SKU</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {data.low_stock_products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="py-2">{p.name}</td>
                <td>{p.sku}</td>
                <td className="text-amber-600 font-medium">{p.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
