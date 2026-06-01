import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEye } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';
import { ordersAPI } from '../../services/api';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Processing: 'bg-blue-100 text-blue-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

export default function OrdersList() {
  const [data, setData] = useState({ items: [], page: 1, total_pages: 1 });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (page = 1) => {
    setLoading(true);
    ordersAPI
      .list({ page, page_size: 10, status: status || undefined })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1);
  }, [status]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="page-title">Orders</h1>
        <Link to="/orders/new" className="btn-primary"><FiPlus className="mr-2" /> Create Order</Link>
      </div>
      <select className="input-field mt-4 max-w-xs" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All Statuses</option>
        {['Pending', 'Processing', 'Completed', 'Cancelled'].map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
          <table className="min-w-full divide-y text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.items.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">#{o.id}</td>
                  <td className="px-4 py-3">{o.customer_name}</td>
                  <td className="px-4 py-3">${Number(o.total_amount).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[o.status] || ''}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{new Date(o.order_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/orders/${o.id}`} className="inline-flex rounded p-1 hover:bg-slate-100"><FiEye /></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={data.page} totalPages={data.total_pages} onPageChange={load} />
    </div>
  );
}
