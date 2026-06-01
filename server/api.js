import { queryAll, queryOne, run, lastInsertId } from './db.js';

const LOW_STOCK = 10;

function mapProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    description: row.description ?? null,
    price: Number(row.price),
    quantity: row.quantity,
    category: row.category,
    image_url: row.image_url ?? null,
    is_featured: Boolean(row.is_featured),
    created_at: row.created_at || new Date().toISOString(),
  };
}

function paginate(items, page, pageSize) {
  const total = items.length;
  const total_pages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total,
    page,
    page_size: pageSize,
    total_pages,
  };
}

export function registerApiRoutes(app, auth) {
  app.get('/api/products/featured', (req, res) => {
    const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 8));
    const rows = queryAll(
      'SELECT * FROM products WHERE is_featured = 1 ORDER BY id DESC LIMIT ?',
      [limit]
    );
    res.json(rows.map(mapProduct));
  });

  app.get('/api/products/public', (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.page_size) || 12));
    const rows = queryAll('SELECT * FROM products ORDER BY id DESC').map(mapProduct);
    res.json(paginate(rows, page, pageSize));
  });

  app.get('/api/products/public/:id', (req, res) => {
    const row = queryOne('SELECT * FROM products WHERE id = ?', [Number(req.params.id)]);
    if (!row) return res.status(404).json({ detail: 'Product not found' });
    res.json(mapProduct(row));
  });

  app.get('/api/products/categories', auth, (req, res) => {
    const rows = queryAll('SELECT DISTINCT category FROM products ORDER BY category');
    res.json(rows.map((r) => r.category));
  });

  app.get('/api/products', auth, (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.page_size) || 10));
    let rows = queryAll('SELECT * FROM products ORDER BY id DESC').map(mapProduct);
    const search = (req.query.search || '').toLowerCase();
    const category = req.query.category;
    if (search) {
      rows = rows.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.sku.toLowerCase().includes(search) ||
          (p.description || '').toLowerCase().includes(search)
      );
    }
    if (category) rows = rows.filter((p) => p.category === category);
    res.json(paginate(rows, page, pageSize));
  });

  app.get('/api/products/:id', auth, (req, res) => {
    const row = queryOne('SELECT * FROM products WHERE id = ?', [Number(req.params.id)]);
    if (!row) return res.status(404).json({ detail: 'Product not found' });
    res.json(mapProduct(row));
  });

  app.post('/api/products', auth, (req, res) => {
    const b = req.body || {};
    if (!b.name || !b.sku || b.price == null) {
      return res.status(400).json({ detail: 'name, sku, and price are required' });
    }
    const exists = queryOne('SELECT id FROM products WHERE sku = ?', [b.sku]);
    if (exists) return res.status(400).json({ detail: 'SKU already exists' });
    run(
      `INSERT INTO products (name, sku, description, price, quantity, category, image_url, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b.name,
        b.sku,
        b.description || null,
        b.price,
        b.quantity ?? 0,
        b.category || 'General',
        b.image_url || null,
        b.is_featured ? 1 : 0,
      ]
    );
    const row = queryOne('SELECT * FROM products WHERE id = ?', [lastInsertId()]);
    res.status(201).json(mapProduct(row));
  });

  app.put('/api/products/:id', auth, (req, res) => {
    const id = Number(req.params.id);
    const existing = queryOne('SELECT * FROM products WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ detail: 'Product not found' });
    const b = req.body || {};
    run(
      `UPDATE products SET name=?, sku=?, description=?, price=?, quantity=?, category=?, image_url=?, is_featured=?
       WHERE id=?`,
      [
        b.name ?? existing.name,
        b.sku ?? existing.sku,
        b.description ?? existing.description,
        b.price ?? existing.price,
        b.quantity ?? existing.quantity,
        b.category ?? existing.category,
        b.image_url ?? existing.image_url,
        b.is_featured != null ? (b.is_featured ? 1 : 0) : existing.is_featured,
        id,
      ]
    );
    res.json(mapProduct(queryOne('SELECT * FROM products WHERE id = ?', [id])));
  });

  app.delete('/api/products/:id', auth, (req, res) => {
    run('DELETE FROM products WHERE id = ?', [Number(req.params.id)]);
    res.status(204).send();
  });

  app.get('/api/customers', auth, (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.page_size) || 10));
    const rows = queryAll('SELECT * FROM customers ORDER BY id DESC');
    res.json(paginate(rows, page, pageSize));
  });

  app.get('/api/customers/:id', auth, (req, res) => {
    const row = queryOne('SELECT * FROM customers WHERE id = ?', [Number(req.params.id)]);
    if (!row) return res.status(404).json({ detail: 'Customer not found' });
    res.json(row);
  });

  app.post('/api/customers', auth, (req, res) => {
    const b = req.body || {};
    const dup = queryOne('SELECT id FROM customers WHERE lower(email) = ?', [
      String(b.email || '').toLowerCase(),
    ]);
    if (dup) return res.status(400).json({ detail: 'Email is already registered' });
    run(
      `INSERT INTO customers (full_name, email, phone, address, city, state, country)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [b.full_name, b.email, b.phone, b.address, b.city, b.state, b.country]
    );
    res.status(201).json(queryOne('SELECT * FROM customers WHERE id = ?', [lastInsertId()]));
  });

  app.put('/api/customers/:id', auth, (req, res) => {
    const id = Number(req.params.id);
    const existing = queryOne('SELECT * FROM customers WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ detail: 'Customer not found' });
    const b = req.body || {};
    if (b.email) {
      const dup = queryOne(
        'SELECT id FROM customers WHERE lower(email) = ? AND id != ?',
        [String(b.email).toLowerCase(), id]
      );
      if (dup) return res.status(400).json({ detail: 'Email is already registered' });
    }
    run(
      `UPDATE customers SET full_name=?, email=?, phone=?, address=?, city=?, state=?, country=? WHERE id=?`,
      [
        b.full_name ?? existing.full_name,
        b.email ?? existing.email,
        b.phone ?? existing.phone,
        b.address ?? existing.address,
        b.city ?? existing.city,
        b.state ?? existing.state,
        b.country ?? existing.country,
        id,
      ]
    );
    res.json(queryOne('SELECT * FROM customers WHERE id = ?', [id]));
  });

  app.delete('/api/customers/:id', auth, (req, res) => {
    const id = Number(req.params.id);
    const orders = queryOne('SELECT id FROM orders WHERE customer_id = ? LIMIT 1', [id]);
    if (orders) {
      return res.status(400).json({ detail: 'Cannot delete customer with existing orders' });
    }
    run('DELETE FROM customers WHERE id = ?', [id]);
    res.status(204).send();
  });

  function buildOrderResponse(orderId) {
    const order = queryOne(
      `SELECT o.*, c.full_name AS customer_name FROM orders o
       LEFT JOIN customers c ON c.id = o.customer_id WHERE o.id = ?`,
      [orderId]
    );
    if (!order) return null;
    const items = queryAll(
      `SELECT oi.*, p.name AS product_name FROM order_items oi
       JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?`,
      [orderId]
    );
    return {
      id: order.id,
      customer_id: order.customer_id,
      customer_name: order.customer_name,
      total_amount: Number(order.total_amount),
      status: order.status,
      order_date: order.order_date,
      items: items.map((i) => ({
        id: i.id,
        product_id: i.product_id,
        product_name: i.product_name,
        quantity: i.quantity,
        unit_price: Number(i.unit_price),
        subtotal: Number(i.subtotal),
      })),
    };
  }

  function restoreInventory(orderId) {
    const items = queryAll('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    for (const item of items) {
      const product = queryOne('SELECT * FROM products WHERE id = ?', [item.product_id]);
      if (!product) continue;
      const prev = product.quantity;
      const next = prev + item.quantity;
      run('UPDATE products SET quantity = ? WHERE id = ?', [next, product.id]);
      run(
        `INSERT INTO inventory_logs (product_id, change_amount, previous_quantity, new_quantity, reason, notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          product.id,
          item.quantity,
          prev,
          next,
          'Order cancellation',
          `Order #${orderId} cancelled`,
        ]
      );
    }
  }

  app.get('/api/orders', auth, (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.page_size) || 10));
    const orders = queryAll('SELECT id FROM orders ORDER BY id DESC');
    const full = orders.map((o) => buildOrderResponse(o.id)).filter(Boolean);
    res.json(paginate(full, page, pageSize));
  });

  app.get('/api/orders/:id', auth, (req, res) => {
    const order = buildOrderResponse(Number(req.params.id));
    if (!order) return res.status(404).json({ detail: 'Order not found' });
    res.json(order);
  });

  app.post('/api/orders', auth, (req, res) => {
    const { customer_id, items } = req.body || {};
    if (!customer_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ detail: 'customer_id and items are required' });
    }
    const customer = queryOne('SELECT id FROM customers WHERE id = ?', [customer_id]);
    if (!customer) return res.status(404).json({ detail: 'Customer not found' });

    let total = 0;
    const lineItems = [];
    for (const item of items) {
      const product = queryOne('SELECT * FROM products WHERE id = ?', [item.product_id]);
      if (!product) {
        return res.status(404).json({ detail: `Product with id ${item.product_id} not found` });
      }
      const qty = Number(item.quantity);
      if (product.quantity < qty) {
        return res.status(400).json({
          detail: `Insufficient stock for '${product.name}'. Available: ${product.quantity}, Requested: ${qty}`,
        });
      }
      total += Number(product.price) * qty;
      lineItems.push({ product, qty });
    }

    run('INSERT INTO orders (customer_id, total_amount, status) VALUES (?, ?, ?)', [
      customer_id,
      total,
      'Pending',
    ]);
    const orderId = lastInsertId();

    for (const { product, qty } of lineItems) {
      const unit = Number(product.price);
      const subtotal = unit * qty;
      run(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, product.id, qty, unit, subtotal]
      );
      const prev = product.quantity;
      const next = prev - qty;
      run('UPDATE products SET quantity = ? WHERE id = ?', [next, product.id]);
      run(
        `INSERT INTO inventory_logs (product_id, change_amount, previous_quantity, new_quantity, reason, notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [product.id, -qty, prev, next, 'Order placement', `Order #${orderId}`]
      );
    }

    res.status(201).json(buildOrderResponse(orderId));
  });

  app.patch('/api/orders/:id/status', auth, (req, res) => {
    const orderId = Number(req.params.id);
    const order = queryOne('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!order) return res.status(404).json({ detail: 'Order not found' });
    const newStatus = req.body?.status;
    if (!newStatus) return res.status(400).json({ detail: 'status is required' });
    if (order.status === 'Cancelled') {
      return res.status(400).json({ detail: 'Cannot update a cancelled order' });
    }
    if (newStatus === 'Cancelled' && order.status !== 'Cancelled') {
      restoreInventory(orderId);
    }
    run('UPDATE orders SET status = ? WHERE id = ?', [newStatus, orderId]);
    res.json(buildOrderResponse(orderId));
  });

  app.post('/api/orders/:id/cancel', auth, (req, res) => {
    const orderId = Number(req.params.id);
    const order = queryOne('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!order) return res.status(404).json({ detail: 'Order not found' });
    if (order.status === 'Cancelled') {
      return res.status(400).json({ detail: 'Order is already cancelled' });
    }
    if (order.status === 'Completed') {
      return res.status(400).json({ detail: 'Cannot cancel a completed order' });
    }
    restoreInventory(orderId);
    run('UPDATE orders SET status = ? WHERE id = ?', ['Cancelled', orderId]);
    res.json(buildOrderResponse(orderId));
  });

  app.get('/api/inventory/low-stock', auth, (req, res) => {
    const threshold = Number(req.query.threshold) || LOW_STOCK;
    const rows = queryAll('SELECT * FROM products WHERE quantity < ? ORDER BY quantity', [
      threshold,
    ]);
    res.json(rows.map(mapProduct));
  });

  app.get('/api/inventory/dashboard', auth, (req, res) => {
    const threshold = Number(req.query.low_threshold) || LOW_STOCK;
    const products = queryAll('SELECT * FROM products ORDER BY name');
    const summary = products.map((p) => ({
      product_id: p.id,
      product_name: p.name,
      sku: p.sku,
      quantity: p.quantity,
      category: p.category,
      is_low_stock: p.quantity < threshold,
    }));
    const low = summary.filter((s) => s.is_low_stock);
    res.json({
      total_products: products.length,
      total_quantity: products.reduce((a, p) => a + p.quantity, 0),
      low_stock_count: low.length,
      products: summary,
    });
  });

  app.get('/api/inventory/logs', auth, (req, res) => {
    const limit = Math.min(200, Number(req.query.limit) || 50);
    const rows = queryAll(
      `SELECT l.*, p.name AS product_name FROM inventory_logs l
       LEFT JOIN products p ON p.id = l.product_id ORDER BY l.id DESC LIMIT ?`,
      [limit]
    );
    res.json(rows);
  });

  app.get('/api/reports/summary', auth, (req, res) => {
    const total_products = queryOne('SELECT COUNT(*) AS c FROM products')?.c ?? 0;
    const total_customers = queryOne('SELECT COUNT(*) AS c FROM customers')?.c ?? 0;
    const total_orders = queryOne('SELECT COUNT(*) AS c FROM orders')?.c ?? 0;
    const revenue =
      queryOne(
        `SELECT COALESCE(SUM(total_amount), 0) AS r FROM orders WHERE status != 'Cancelled'`
      )?.r ?? 0;
    const low_stock_products = queryAll('SELECT * FROM products WHERE quantity < ?', [
      LOW_STOCK,
    ]).map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      quantity: p.quantity,
      category: p.category,
    }));
    const statusRows = queryAll(
      'SELECT status, COUNT(*) AS c FROM orders GROUP BY status'
    );
    const orders_by_status = Object.fromEntries(
      statusRows.map((r) => [r.status, r.c])
    );
    res.json({
      total_products,
      total_customers,
      total_orders,
      total_revenue: Number(revenue),
      low_stock_products,
      orders_by_status,
      revenue_by_month: [],
      top_products: [],
    });
  });
}
