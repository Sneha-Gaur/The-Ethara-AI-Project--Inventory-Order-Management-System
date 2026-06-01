import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProductDetailView from '../../components/ProductDetailView';
import { productsAPI, inventoryAPI } from '../../services/api';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productsAPI.get(id),
      inventoryAPI.logs({ product_id: id, limit: 10 }),
    ])
      .then(([productRes, logsRes]) => {
        setProduct(productRes.data);
        setInventoryLogs(logsRes.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!product) return <p className="text-slate-600">Product not found</p>;

  return (
    <ProductDetailView
      product={product}
      inventoryLogs={inventoryLogs}
      mode="admin"
      detailPathPrefix="/products"
      backLink="/products"
      backLabel="Back to Products"
    />
  );
}
