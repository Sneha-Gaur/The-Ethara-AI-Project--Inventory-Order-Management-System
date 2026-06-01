import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiStar } from 'react-icons/fi';
import { productsAPI } from '../services/api';
import { getStockStatus } from './ProductDetailView';

export default function FeaturedProducts({ title = 'Featured Products', subtitle, viewAllLink = '/catalog' }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsAPI
      .featured(8)
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      </section>
    );
  }

  if (!products.length) return null;

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h2 className="text-3xl font-bold">{title}</h2>
            {subtitle && <p className="mt-2 text-slate-600">{subtitle}</p>}
          </div>
          <Link to={viewAllLink} className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:underline">
            View all products <FiArrowRight />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => {
            const stock = getStockStatus(p.quantity);
            return (
              <Link
                key={p.id}
                to={`/catalog/${p.id}`}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative">
                  <img
                    src={p.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'}
                    alt={p.name}
                    className="h-48 w-full object-cover transition group-hover:scale-105"
                  />
                  {p.is_featured && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary-600 px-2 py-1 text-xs font-semibold text-white">
                      <FiStar className="h-3 w-3" /> Featured
                    </span>
                  )}
                  <span className={`absolute right-3 top-3 rounded-full px-2 py-1 text-xs font-medium ${stock.className}`}>
                    {stock.label}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-xs font-medium uppercase text-slate-500">{p.category}</p>
                  <h3 className="mt-1 font-semibold text-slate-900 group-hover:text-primary-600">{p.name}</h3>
                  <p className="mt-2 text-lg font-bold text-primary-600">${Number(p.price).toFixed(2)}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">{p.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-600">
                    View details <FiArrowRight className="transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
