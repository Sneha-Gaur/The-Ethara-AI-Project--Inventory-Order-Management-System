import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function NotFound() {
  return (
    <Layout>
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <img src="https://images.unsplash.com/photo-1578328811275-2c0b6bb3143f?w=400" alt="404" className="mb-8 h-48 w-48 rounded-2xl object-cover opacity-80" />
        <h1 className="text-6xl font-bold text-primary-600">404</h1>
        <p className="mt-4 text-xl text-slate-600">Page not found</p>
        <Link to="/" className="btn-primary mt-8">Back to Home</Link>
      </div>
    </Layout>
  );
}
