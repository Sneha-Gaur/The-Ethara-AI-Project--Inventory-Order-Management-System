import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Alert from '../../components/Alert';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ordersAPI } from '../../services/api';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = () => {
    ordersAPI.get(id).then((r) => setOrder(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const updateStatus = async (status) => {
    setError('');
    try {
      const { data } = await ordersAPI.updateStatus(id, status);
      setOrder(data);
      setMessage('Status updated');
    } catch (e) {
      setError(e.response?.data?.detail || 'Update failed');
    }
  };

  const cancel = async () => {
    if (!window.confirm('Cancel this order? Inventory will be restored.')) return;
    try {
      const { data } = await ordersAPI.cancel(id);
      setOrder(data);
      setMessage('Order cancelled');
    } catch (e) {
      setError(e.response?.data?.detail || 'Cancel failed');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!order) return <p>Order not found</p>;

  return (
    <div>
      <h1 className="page-title">Order #{order.id}</h1>
      <Alert type="success" message={message} onClose={() => setMessage('')} />
      <Alert message={error} onClose={() => setError('')} />
      <div className="card mt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <p><span className="text-slate-500">Customer:</span> {order.customer_name}</p>
          <p><span className="text-slate-500">Status:</span> <strong>{order.status}</strong></p>
          <p><span className="text-slate-500">Date:</span> {new Date(order.order_date).toLocaleString()}</p>
          <p><span className="text-slate-500">Total:</span> <strong>${Number(order.total_amount).toFixed(2)}</strong></p>
        </div>
        {order.status !== 'Cancelled' && order.status !== 'Completed' && (
          <div className="mt-4 flex flex-wrap gap-2">
            {['Processing', 'Completed'].map((s) => (
              <button key={s} type="button" onClick={() => updateStatus(s)} className="btn-secondary text-sm">
                Mark {s}
              </button>
            ))}
            <button type="button" onClick={cancel} className="btn-danger text-sm">Cancel Order</button>
          </div>
        )}
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="py-2">Product</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-2">{item.product_name}</td>
                <td>{item.quantity}</td>
                <td>${Number(item.unit_price).toFixed(2)}</td>
                <td>${Number(item.subtotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
