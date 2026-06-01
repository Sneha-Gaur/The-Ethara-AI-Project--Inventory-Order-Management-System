import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Alert from '../../components/Alert';
import LoadingSpinner from '../../components/LoadingSpinner';
import { productsAPI } from '../../services/api';

const empty = {
  name: '',
  sku: '',
  description: '',
  price: '',
  quantity: 0,
  category: '',
  image_url: '',
  is_featured: false,
};

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!id) return;
    productsAPI
      .get(id)
      .then((res) => {
        const p = res.data;
        setForm({
          name: p.name,
          sku: p.sku,
          description: p.description || '',
          price: String(p.price),
          quantity: p.quantity,
          category: p.category,
          image_url: p.image_url || '',
          is_featured: p.is_featured || false,
        });
      })
      .catch(() => setError('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      ...form,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity, 10),
    };
    try {
      if (isEdit) await productsAPI.update(id, payload);
      else await productsAPI.create(payload);
      navigate('/products');
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(Array.isArray(d) ? d.map((x) => x.msg).join(', ') : d || 'Save failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="page-title">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
      <Alert message={error} onClose={() => setError('')} />
      <form onSubmit={handleSubmit} className="card mt-6 max-w-2xl space-y-4">
        {['name', 'sku', 'category', 'price', 'quantity', 'image_url'].map((field) => (
          <div key={field}>
            <label className="mb-1 block text-sm font-medium capitalize">{field.replace('_', ' ')}</label>
            <input
              required={field !== 'image_url'}
              type={['price', 'quantity'].includes(field) ? 'number' : 'text'}
              step={field === 'price' ? '0.01' : undefined}
              min={field === 'quantity' ? 0 : undefined}
              className="input-field"
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            />
          </div>
        ))}
        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea className="input-field" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm font-medium">Show on home page as featured product</span>
        </label>
        <div className="flex gap-3">
          <button type="submit" className="btn-primary">Save Product</button>
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
