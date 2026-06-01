import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiStar } from 'react-icons/fi';
import Layout from '../../components/Layout';
import Pagination from '../../components/Pagination';
import { getStockStatus } from '../../components/ProductDetailView';
import { productsAPI } from '../../services/api';

export default function CatalogList() {
  const [data, setData] = useState({ items: [], page: 1, total_pages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (page = 1) => {
    setLoading(true);
    productsAPI
      .listPublic({ page, page_size: 12 })
      .then((res) => {
        let items = res.data.items;
        if (search.trim()) {
          const term = search.toLowerCase();
          items = items.filter(
            (p) =>
              p.name.toLowerCase().includes(term) ||
              p.sku.toLowerCase().includes(term) ||
              p.category.toLowerCase().includes(term)
          );
        }
        setData({ ...res.data, items });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1);
  }, [search]);

  return (
    <Layout>
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold">Product Catalog</h1>
          <p className="mt-4 max-w-2xl text-primary-100">
            Browse our featured inventory. Click any product for full specifications and availability.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-3 text-slate-400" />
          <input
            className="input-field pl-10"
            placeholder="Search catalog..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((p) => {
              const stock = getStockStatus(p.quantity);
              return (
                <Link
                  key={p.id}
                  to={`/catalog/${p.id}`}
                  className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
                >
                  <img
                    src={p.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'}
                    alt={p.name}
                    className="h-44 w-full object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-500">{p.category}</span>
                      {p.is_featured && (
                        <FiStar className="h-4 w-4 text-amber-500" title="Featured" />
                      )}
                    </div>
                    <h2 className="mt-1 font-semibold group-hover:text-primary-600">{p.name}</h2>
                    <p className="mt-1 text-lg font-bold text-primary-600">${Number(p.price).toFixed(2)}</p>
                    <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${stock.className}`}>
                      {stock.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!search && (
          <Pagination page={data.page} totalPages={data.total_pages} onPageChange={load} />
        )}
      </section>
    </Layout>
  );
}
