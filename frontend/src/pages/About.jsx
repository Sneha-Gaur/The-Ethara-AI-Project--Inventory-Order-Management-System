import Layout from '../components/Layout';

export default function About() {
  return (
    <Layout>
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-bold">About Us</h1>
          <p className="mt-4 text-primary-100">Building the future of inventory management</p>
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-4 py-16">
        <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800" alt="Team collaboration" className="mb-8 w-full rounded-2xl shadow-lg" />
        <p className="text-lg leading-relaxed text-slate-600">
          Ethara Inventory is a modern SaaS platform designed for businesses that need reliable stock tracking,
          customer management, and order fulfillment. Our mission is to eliminate stockouts, reduce manual errors,
          and give teams real-time visibility into their operations.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          Founded in 2024, we serve retailers, wholesalers, and e-commerce brands worldwide with enterprise-grade
          security, role-based access, and analytics that drive smarter decisions.
        </p>
      </section>
    </Layout>
  );
}
