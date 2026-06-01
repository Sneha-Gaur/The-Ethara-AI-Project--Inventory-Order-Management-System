import Layout from '../components/Layout';

export function Privacy() {
  return (
    <Layout>
      <article className="mx-auto max-w-3xl px-4 py-16 prose prose-slate">
        <h1>Privacy Policy</h1>
        <p>Last updated: June 2026</p>
        <p>Ethara Inventory respects your privacy. We collect only data necessary to provide our inventory management services, including account information and business operational data you enter into the platform.</p>
        <h2>Data We Collect</h2>
        <p>Account credentials, product and customer records, order history, and usage analytics.</p>
        <h2>How We Use Data</h2>
        <p>To operate the service, improve features, and provide customer support. We do not sell your data to third parties.</p>
      </article>
    </Layout>
  );
}

export function Terms() {
  return (
    <Layout>
      <article className="mx-auto max-w-3xl px-4 py-16 prose prose-slate">
        <h1>Terms & Conditions</h1>
        <p>By using Ethara Inventory, you agree to these terms.</p>
        <h2>Service Use</h2>
        <p>You are responsible for maintaining the confidentiality of your account and for all activity under your account.</p>
        <h2>Limitation of Liability</h2>
        <p>Ethara Inventory is provided as-is. We are not liable for indirect damages arising from use of the platform.</p>
      </article>
    </Layout>
  );
}
