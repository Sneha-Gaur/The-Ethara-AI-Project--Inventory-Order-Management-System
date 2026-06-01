import { useState } from 'react';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import Layout from '../components/Layout';

export default function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <Layout>
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="page-title text-center">Contact Us</h1>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">We&apos;d love to hear from you</p>
          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            <div className="space-y-6">
              {[
                { icon: FiMapPin, text: '123 Business Park, San Francisco, CA' },
                { icon: FiMail, text: 'support@etharainventory.com' },
                { icon: FiPhone, text: '+1 (555) 123-4567' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary-100 p-3 text-primary-600"><Icon className="h-6 w-6" /></div>
                  <span>{text}</span>
                </div>
              ))}
              <img src="https://images.unsplash.com/photo-1423666639046-f560006c2aaf?w=600" alt="Contact" className="rounded-2xl" />
            </div>
            <form onSubmit={handleSubmit} className="card">
              {sent ? (
                <p className="text-green-600">Thank you! We&apos;ll get back to you soon.</p>
              ) : (
                <>
                  <div className="space-y-4">
                    <input required placeholder="Name" className="input-field" />
                    <input required type="email" placeholder="Email" className="input-field" />
                    <textarea required rows={5} placeholder="Message" className="input-field" />
                  </div>
                  <button type="submit" className="btn-primary mt-4 w-full">Send Message</button>
                </>
              )}
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
}
