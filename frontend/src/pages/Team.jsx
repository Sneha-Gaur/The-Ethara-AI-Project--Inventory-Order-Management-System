import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const team = [
  { name: 'Alex Morgan', role: 'CEO & Founder', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300', bio: '15+ years in supply chain technology.' },
  { name: 'Priya Sharma', role: 'CTO', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300', bio: 'Former lead engineer at major SaaS platforms.' },
  { name: 'James Wilson', role: 'Head of Product', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300', bio: 'Passionate about UX and operational efficiency.' },
  { name: 'Maria Garcia', role: 'Customer Success', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300', bio: 'Helps clients achieve measurable ROI.' },
];

export default function Team() {
  return (
    <Layout>
      <section className="bg-primary-700 py-16 text-center text-white">
        <h1 className="text-4xl font-bold">Our Team</h1>
        <p className="mt-4 text-primary-100">The people behind Ethara Inventory</p>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((m) => (
            <div key={m.name} className="card text-center">
              <img src={m.image} alt={m.name} className="mx-auto h-32 w-32 rounded-full object-cover" />
              <h3 className="mt-4 font-semibold">{m.name}</h3>
              <p className="text-sm text-primary-600">{m.role}</p>
              <p className="mt-2 text-sm text-slate-600">{m.bio}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/contact" className="btn-primary">Get in Touch</Link>
        </div>
      </section>
    </Layout>
  );
}
