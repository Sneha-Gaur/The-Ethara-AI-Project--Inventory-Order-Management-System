import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';
import Alert from '../../components/Alert';
import { customersAPI } from '../../services/api';

export default function CustomersList() {
  const [data, setData] = useState({ items: [], page: 1, total_pages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = (page = 1) => {
    setLoading(true);
    customersAPI
      .list({ page, page_size: 10, search: search || undefined })
      .then((res) => setData(res.data))
      .catch((e) => setError(e.response?.data?.detail || 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1);
  }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try {
      await customersAPI.delete(id);
      load(data.page);
    } catch (e) {
      setError(e.response?.data?.detail || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="page-title">Customers</h1>
        <Link to="/customers/new" className="btn-primary"><FiPlus className="mr-2" /> Add Customer</Link>
      </div>
      <Alert message={error} onClose={() => setError('')} />
      <div className="relative mt-6 max-w-md">
        <FiSearch className="absolute left-3 top-3 text-slate-400" />
        <input className="input-field pl-10" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
          <table className="min-w-full divide-y text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.items.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{c.full_name}</td>
                  <td className="px-4 py-3">{c.email}</td>
                  <td className="px-4 py-3">{c.phone}</td>
                  <td className="px-4 py-3">{c.city}, {c.state}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/customers/${c.id}`} className="rounded p-1 hover:bg-slate-100"><FiEye /></Link>
                      <Link to={`/customers/${c.id}/edit`} className="rounded p-1 hover:bg-slate-100"><FiEdit /></Link>
                      <button type="button" onClick={() => handleDelete(c.id)} className="rounded p-1 text-red-500"><FiTrash2 /></button>
                    </div>
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
