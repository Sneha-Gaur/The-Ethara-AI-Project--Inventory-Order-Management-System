import { Link } from 'react-router-dom';
import {
  FiPackage,
  FiTag,
  FiCalendar,
  FiEdit,
  FiShoppingCart,
  FiArrowLeft,
  FiStar,
  FiAlertTriangle,
} from 'react-icons/fi';

const LOW_STOCK = 10;

export function getStockStatus(quantity) {
  if (quantity === 0) return { label: 'Out of Stock', className: 'bg-red-100 text-red-800' };
  if (quantity <= LOW_STOCK) return { label: 'Low Stock', className: 'bg-amber-100 text-amber-800' };
  return { label: 'In Stock', className: 'bg-green-100 text-green-800' };
}

export default function ProductDetailView({
  product,
  inventoryLogs = [],
  mode = 'public',
  detailPathPrefix = '/catalog',
  backLink = '/catalog',
  backLabel = 'Back to Catalog',
}) {
  if (!product) return null;

  const stock = getStockStatus(product.quantity);
  const detailUrl = `${detailPathPrefix}/${product.id}`;
  const isAdmin = mode === 'admin';

  const specs = [
    { icon: FiTag, label: 'SKU', value: product.sku },
    { icon: FiPackage, label: 'Category', value: product.category },
    { icon: FiPackage, label: 'Price', value: `$${Number(product.price).toFixed(2)}` },
    { icon: FiPackage, label: 'Available Units', value: product.quantity },
    {
      icon: FiCalendar,
      label: 'Listed Since',
      value: new Date(product.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    },
  ];

  return (
    <div>
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span>/</span>
        <Link to={backLink} className="hover:text-primary-600">{backLabel.replace('Back to ', '')}</Link>
        <span>/</span>
        <span className="text-slate-900">{product.name}</span>
      </nav>

      <Link to={backLink} className="mb-4 inline-flex items-center gap-2 text-sm text-primary-600 hover:underline">
        <FiArrowLeft /> {backLabel}
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <img
              src={product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
              alt={product.name}
              className="h-80 w-full object-cover sm:h-96"
            />
          </div>
          <div className="mt-3 flex gap-2">
            {[product.image_url, product.image_url, product.image_url]
              .filter(Boolean)
              .slice(0, 3)
              .map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="h-16 w-16 rounded-lg border border-slate-200 object-cover opacity-80"
                />
              ))}
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-start gap-3">
            {product.is_featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
                <FiStar className="h-3 w-3" /> Featured
              </span>
            )}
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stock.className}`}>
              {stock.label}
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{product.name}</h1>
          <p className="mt-2 text-3xl font-bold text-primary-600">${Number(product.price).toFixed(2)}</p>

          <p className="mt-6 leading-relaxed text-slate-600">
            {product.description ||
              'No description available for this product. Contact us for more specifications and bulk pricing.'}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {specs.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
                  <p className="mt-1 font-semibold text-slate-900">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {isAdmin ? (
              <>
                <Link to={`/products/${product.id}/edit`} className="btn-primary">
                  <FiEdit className="mr-2" /> Edit Product
                </Link>
                <Link to="/orders/new" className="btn-secondary">
                  <FiShoppingCart className="mr-2" /> Create Order
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" state={{ from: { pathname: `/products/${product.id}` } }} className="btn-primary">
                  Login to Order
                </Link>
                <Link to="/signup" className="btn-secondary">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {product.quantity <= LOW_STOCK && product.quantity > 0 && (
            <div className="mt-6 flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <FiAlertTriangle />
              Only {product.quantity} units left — order soon!
            </div>
          )}
        </div>
      </div>

      {isAdmin && inventoryLogs.length > 0 && (
        <div className="card mt-10">
          <h2 className="text-lg font-semibold">Inventory Activity</h2>
          <ul className="mt-4 divide-y text-sm">
            {inventoryLogs.map((log) => (
              <li key={log.id} className="flex justify-between py-3">
                <div>
                  <p className="font-medium">{log.reason}</p>
                  <p className="text-slate-500">{log.notes || '—'}</p>
                </div>
                <div className="text-right">
                  <span className={log.change_amount < 0 ? 'text-red-600' : 'text-green-600'}>
                    {log.change_amount > 0 ? '+' : ''}
                    {log.change_amount}
                  </span>
                  <p className="text-xs text-slate-400">
                    {log.previous_quantity} → {log.new_quantity}
                  </p>
                  <p className="text-xs text-slate-400">{new Date(log.created_at).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-10 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
        Product ID: {product.id} ·{' '}
        <Link to={detailUrl} className="text-primary-600 hover:underline">
          View public catalog page
        </Link>
      </div>
    </div>
  );
}
