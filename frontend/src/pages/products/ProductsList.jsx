import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiEye, FiStar } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';
import Alert from '../../components/Alert';
import { productsAPI } from '../../services/api';

export default function ProductsList() {
  const [data, setData] = useState({ items: [], page: 1, total_pages: 1 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = (page = 1) => {
    setLoading(true);
    productsAPI
      .list({ page, page_size: 10, search: search || undefined, category: category || undefined })
      .then((res) => setData(res.data))
      .catch((e) => setError(e.response?.data?.detail || 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    productsAPI.categories().then((r) => setCategories(r.data));
  }, []);

  useEffect(() => {
    load(1);
  }, [search, category]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productsAPI.delete(id);
      load(data.page);
    } catch (e) {
      setError(e.response?.data?.detail || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="page-title">Products</h1>
        <Link to="/products/new" className="btn-primary">
          <FiPlus className="mr-2" /> Add Product
        </Link>
      </div>
      <Alert message={error} onClose={() => setError('')} />
      <div className="mt-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-3 text-slate-400" />
          <input
            className="input-field pl-10"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input-field sm:w-48" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Product</th>
                <th className="px-4 py-3 text-left font-medium">SKU</th>
                <th className="px-4 py-3 text-left font-medium">Price</th>
                <th className="px-4 py-3 text-left font-medium">Stock</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.items.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image_url || 'https://via.placeholder.com/40'} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <span className="font-medium">
                        {p.name}
                        {p.is_featured && <FiStar className="ml-1 inline text-amber-500" title="Featured" />}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{p.sku}</td>
                  <td className="px-4 py-3">${Number(p.price).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={p.quantity <= 10 ? 'font-medium text-amber-600' : ''}>{p.quantity}</span>
                  </td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/products/${p.id}`} className="rounded p-1 text-slate-500 hover:bg-slate-100"><FiEye /></Link>
                      <Link to={`/products/${p.id}/edit`} className="rounded p-1 text-slate-500 hover:bg-slate-100"><FiEdit /></Link>
                      <button type="button" onClick={() => handleDelete(p.id)} className="rounded p-1 text-red-500 hover:bg-red-50"><FiTrash2 /></button>
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
