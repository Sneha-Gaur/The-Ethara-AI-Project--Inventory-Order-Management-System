import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProductDetailView from '../../components/ProductDetailView';
import FeaturedProducts from '../../components/FeaturedProducts';
import { productsAPI } from '../../services/api';

export default function CatalogDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    productsAPI
      .getPublic(id)
      .then((r) => setProduct(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {loading ? (
          <LoadingSpinner />
        ) : error || !product ? (
          <div className="card text-center">
            <h1 className="text-xl font-semibold">Product not found</h1>
            <p className="mt-2 text-slate-600">This item may have been removed from the catalog.</p>
          </div>
        ) : (
          <ProductDetailView
            product={product}
            mode="public"
            detailPathPrefix="/catalog"
            backLink="/catalog"
            backLabel="Back to Catalog"
          />
        )}
      </section>
      {!loading && product && (
        <FeaturedProducts
          title="More Featured Products"
          subtitle="Explore other items in our catalog"
          viewAllLink="/catalog"
        />
      )}
    </Layout>
  );
}
