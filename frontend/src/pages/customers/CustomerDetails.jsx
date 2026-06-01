import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import { customersAPI } from '../../services/api';

export default function CustomerDetails() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customersAPI.get(id).then((r) => setCustomer(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!customer) return <p>Not found</p>;

  return (
    <div>
      <div className="flex justify-between">
        <h1 className="page-title">{customer.full_name}</h1>
        <Link to={`/customers/${id}/edit`} className="btn-primary">Edit</Link>
      </div>
      <div className="card mt-6 max-w-xl space-y-4">
        <p><span className="text-slate-500">Email:</span> {customer.email}</p>
        <p><span className="text-slate-500">Phone:</span> {customer.phone}</p>
        <p><span className="text-slate-500">Address:</span> {customer.address}</p>
        <p><span className="text-slate-500">City:</span> {customer.city}, {customer.state}, {customer.country}</p>
      </div>
    </div>
  );
}
