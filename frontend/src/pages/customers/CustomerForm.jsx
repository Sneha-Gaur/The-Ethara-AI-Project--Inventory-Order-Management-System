import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Alert from '../../components/Alert';
import LoadingSpinner from '../../components/LoadingSpinner';
import { customersAPI } from '../../services/api';

const empty = { full_name: '', email: '', phone: '', address: '', city: '', state: '', country: '' };

export default function CustomerForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!id) return;
    customersAPI.get(id).then((r) => setForm(r.data)).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isEdit) await customersAPI.update(id, form);
      else await customersAPI.create(form);
      navigate('/customers');
    } catch (err) {
      setError(err.response?.data?.detail || 'Save failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="page-title">{isEdit ? 'Edit Customer' : 'Add Customer'}</h1>
      <Alert message={error} onClose={() => setError('')} />
      <form onSubmit={handleSubmit} className="card mt-6 max-w-2xl grid gap-4 sm:grid-cols-2">
        {Object.keys(empty).map((field) => (
          <div key={field} className={field === 'address' ? 'sm:col-span-2' : ''}>
            <label className="mb-1 block text-sm font-medium capitalize">{field.replace('_', ' ')}</label>
            <input required className="input-field" value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
          </div>
        ))}
        <div className="sm:col-span-2 flex gap-3">
          <button type="submit" className="btn-primary">Save</button>
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
