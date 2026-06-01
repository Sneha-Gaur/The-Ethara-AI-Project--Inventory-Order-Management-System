import { Link } from 'react-router-dom';
import { FiPackage, FiFacebook, FiTwitter, FiLinkedin, FiInstagram } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 text-white">
              <FiPackage className="h-7 w-7 text-primary-400" />
              <span className="text-lg font-bold">Ethara Inventory</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Professional inventory and order management for modern businesses. Track stock, manage customers, and fulfill orders with confidence.
            </p>
            <div className="mt-4 flex gap-3">
              {[FiFacebook, FiTwitter, FiLinkedin, FiInstagram].map((Icon, i) => (
                <a key={i} href="#" className="rounded-lg bg-slate-800 p-2 transition hover:bg-primary-600 hover:text-white" aria-label="Social">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                ['/', 'Home'],
                ['/catalog', 'Product Catalog'],
                ['/products', 'Products (Admin)'],
                ['/about', 'About Us'],
                ['/team', 'Our Team'],
                ['/contact', 'Contact'],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-primary-400">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white">Contact</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>123 Business Park, Suite 400</li>
              <li>San Francisco, CA 94107</li>
              <li>support@etharainventory.com</li>
              <li>+1 (555) 123-4567</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white">Legal</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="hover:text-primary-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary-400">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Ethara Inventory. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
