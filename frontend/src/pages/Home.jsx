import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPackage,
  FiUsers,
  FiShoppingCart,
  FiTrendingUp,
  FiCheck,
  FiArrowRight,
} from 'react-icons/fi';
import Layout from '../components/Layout';
import FeaturedProducts from '../components/FeaturedProducts';

const slides = [
  {
    title: 'Smart Inventory Control',
    subtitle: 'Track stock levels in real time and never miss a reorder.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80',
  },
  {
    title: 'Seamless Order Management',
    subtitle: 'From cart to fulfillment — manage every order in one place.',
    image: 'https://images.unsplash.com/photo-1553413077-190a85c7c226?w=1200&q=80',
  },
  {
    title: 'Customer-First CRM',
    subtitle: 'Build lasting relationships with integrated customer profiles.',
    image: 'https://images.unsplash.com/photo-1556745750-6775f616edb9?w=1200&q=80',
  },
];

const stats = [
  { label: 'Products Managed', value: '10K+' },
  { label: 'Orders Processed', value: '50K+' },
  { label: 'Happy Clients', value: '500+' },
  { label: 'Uptime', value: '99.9%' },
];

const features = [
  { icon: FiPackage, title: 'Inventory Tracking', desc: 'Real-time stock levels with low-stock alerts and audit logs.', link: '/catalog' },
  { icon: FiUsers, title: 'Customer CRM', desc: 'Unified customer profiles with order history and contact details.', link: '/about' },
  { icon: FiShoppingCart, title: 'Order Pipeline', desc: 'Pending to completed — full lifecycle with status updates.', link: '/login' },
  { icon: FiTrendingUp, title: 'Analytics & Reports', desc: 'Revenue charts, top products, and business insights.', link: '/signup' },
];

const testimonials = [
  { name: 'Emily Rodriguez', role: 'Operations Manager', text: 'Ethara transformed how we manage warehouse inventory. Stockouts dropped 40%.' },
  { name: 'David Park', role: 'CEO, TechRetail', text: 'The order workflow is intuitive. Our team was productive on day one.' },
  { name: 'Lisa Thompson', role: 'Supply Chain Lead', text: 'Reports and low-stock alerts help us plan purchases proactively.' },
];

const team = [
  { name: 'Alex Morgan', role: 'CEO', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200' },
  { name: 'Priya Sharma', role: 'CTO', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200' },
  { name: 'James Wilson', role: 'Head of Product', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
];

export default function Home() {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <Layout>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-30">
          <img src={slides[slide].image} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-32 lg:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {slides[slide].title}
            </h1>
            <p className="mt-6 text-lg text-primary-100">{slides[slide].subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/signup" className="btn-primary bg-white text-primary-700 hover:bg-primary-50">
                Get Started Free
              </Link>
              <Link to="/about" className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-4 py-2.5 text-sm font-semibold hover:bg-white/10">
                Learn More <FiArrowRight />
              </Link>
            </div>
          </div>
          <div className="mt-8 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSlide(i)}
                className={`h-2 rounded-full transition-all ${i === slide ? 'w-8 bg-white' : 'w-2 bg-white/50'}`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-primary-600">{s.value}</p>
              <p className="mt-1 text-sm text-slate-600">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold">Powerful Features</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
            Everything you need to run inventory and orders at scale.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <Link key={f.title} to={f.link} className="card text-center transition hover:-translate-y-1 hover:shadow-md">
                <f.icon className="mx-auto h-10 w-10 text-primary-600" />
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-600">
                  Learn more <FiArrowRight />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FeaturedProducts
        title="Featured Products"
        subtitle="Explore our top inventory items — click any card for full product details"
        viewAllLink="/catalog"
      />

      <section className="bg-slate-100 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold">Why Choose Us</h2>
          <ul className="mx-auto mt-10 max-w-2xl space-y-4">
            {['Auto inventory reduction on orders', 'Unique SKU & email validation', 'Role-based access (Admin & Staff)', 'Docker-ready deployment'].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <FiCheck className="h-5 w-5 shrink-0 text-green-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {[
        { title: 'Inventory Management', img: 'https://images.unsplash.com/photo-1566576721346-d4a3aa0e9d1b?w=600', text: 'Monitor stock, set alerts, and view change history.', link: '/catalog', linkLabel: 'Browse catalog' },
        { title: 'Customer Management', img: 'https://images.unsplash.com/photo-1556745750-6775f616edb9?w=600', text: 'Centralized profiles with unique email enforcement.', link: '/contact', linkLabel: 'Contact us' },
        { title: 'Order Tracking', img: 'https://images.unsplash.com/photo-1553413077-190a85c7c226?w=600', text: 'Create orders with stock validation and status workflow.', link: '/login', linkLabel: 'Start ordering' },
      ].map((block, i) => (
        <section key={block.title} className={`py-16 ${i % 2 ? 'bg-white' : 'bg-slate-50'}`}>
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 sm:px-6 lg:flex-row lg:px-8">
            <img src={block.img} alt={block.title} className={`h-64 w-full max-w-md rounded-2xl object-cover shadow-lg ${i % 2 ? 'lg:order-2' : ''}`} />
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{block.title}</h2>
              <p className="mt-4 text-slate-600">{block.text}</p>
              <Link to={block.link} className="btn-primary mt-6 inline-flex">
                {block.linkLabel} <FiArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </section>
      ))}

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold">Meet Our Team</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {team.map((m) => (
              <div key={m.name} className="card">
                <img src={m.image} alt={m.name} className="mx-auto h-24 w-24 rounded-full object-cover" />
                <h3 className="mt-4 font-semibold">{m.name}</h3>
                <p className="text-sm text-slate-500">{m.role}</p>
              </div>
            ))}
          </div>
          <Link to="/team" className="btn-primary mt-8 inline-flex">
            View Full Team
          </Link>
        </div>
      </section>

      <section className="bg-primary-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold">What Clients Say</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <blockquote key={t.name} className="card">
                <p className="text-slate-600">&ldquo;{t.text}&rdquo;</p>
                <footer className="mt-4 font-semibold">{t.name}</footer>
                <cite className="text-sm not-italic text-slate-500">{t.role}</cite>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary-700 py-16 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-3xl font-bold">Ready to streamline your operations?</h2>
          <p className="mt-4 text-primary-100">Start managing inventory and orders today.</p>
          <Link to="/contact" className="btn-primary mt-8 inline-flex bg-white text-primary-700 hover:bg-primary-50">
            Contact Us
          </Link>
        </div>
      </section>
    </Layout>
  );
}
