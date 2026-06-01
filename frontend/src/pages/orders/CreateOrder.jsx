import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import Alert from '../../components/Alert';
import { customersAPI, productsAPI, ordersAPI } from '../../services/api';

export default function CreateOrder() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [lines, setLines] = useState([{ product_id: '', quantity: 1 }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    customersAPI.list({ page_size: 100 }).then((r) => setCustomers(r.data.items));
    productsAPI.list({ page_size: 100 }).then((r) => setProducts(r.data.items));
  }, []);

  const addLine = () => setLines([...lines, { product_id: '', quantity: 1 }]);
  const removeLine = (i) => setLines(lines.filter((_, idx) => idx !== i));
  const updateLine = (i, field, val) => {
    const next = [...lines];
    next[i] = { ...next[i], [field]: field === 'quantity' ? parseInt(val, 10) || 1 : val };
    setLines(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!customerId) {
      setError('Select a customer');
      return;
    }
    const items = lines
      .filter((l) => l.product_id)
      .map((l) => ({ product_id: parseInt(l.product_id, 10), quantity: l.quantity }));
    if (!items.length) {
      setError('Add at least one product');
      return;
    }
    setLoading(true);
    try {
      const { data } = await ordersAPI.create({ customer_id: parseInt(customerId, 10), items });
      navigate(`/orders/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Order creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Create Order</h1>
      <Alert message={error} onClose={() => setError('')} />
      <form onSubmit={handleSubmit} className="card mt-6 max-w-2xl space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium">Customer</label>
          <select required className="input-field" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">Select customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
            ))}
          </select>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">Order Items</label>
            <button type="button" onClick={addLine} className="btn-secondary text-sm"><FiPlus /> Add Line</button>
          </div>
          {lines.map((line, i) => (
            <div key={i} className="mb-3 flex gap-2">
              <select
                required
                className="input-field flex-1"
                value={line.product_id}
                onChange={(e) => updateLine(i, 'product_id', e.target.value)}
              >
                <option value="">Product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity}) — ${p.price}</option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                className="input-field w-24"
                value={line.quantity}
                onChange={(e) => updateLine(i, 'quantity', e.target.value)}
              />
              <button type="button" onClick={() => removeLine(i)} className="rounded p-2 text-red-500 hover:bg-red-50">
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}
