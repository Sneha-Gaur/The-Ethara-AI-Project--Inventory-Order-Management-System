import bcrypt from 'bcryptjs';
import { queryOne, run, lastInsertId, saveDb } from './db.js';

export function seedIfEmpty() {
  const userCount = queryOne('SELECT COUNT(*) AS c FROM users')?.c ?? 0;
  if (userCount === 0) {
    const hash = (p) => bcrypt.hashSync(p, 10);
    run(
      `INSERT INTO users (username, email, password_hash, full_name, role, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      ['admin', 'admin@inventory.com', hash('admin123'), 'Admin', 'admin']
    );
    run(
      `INSERT INTO users (username, email, password_hash, full_name, role, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      ['staffuser', 'staff@inventory.com', hash('staff123'), 'Staff', 'staff']
    );
    console.log('Seeded demo users: admin / staffuser');
  }

  const productCount = queryOne('SELECT COUNT(*) AS c FROM products')?.c ?? 0;
  if (productCount === 0) {
    const products = [
      ['Wireless Mouse', 'WM-001', 'Ergonomic wireless mouse', 29.99, 150, 'Electronics', 1],
      ['Mechanical Keyboard', 'KB-002', 'RGB mechanical keyboard', 89.99, 80, 'Electronics', 1],
      ['USB-C Hub', 'HUB-003', '7-in-1 USB-C hub', 45.0, 60, 'Accessories', 1],
      ['27" Monitor', 'MON-005', '4K IPS monitor', 349.99, 25, 'Electronics', 1],
      ['Desk Lamp', 'LAMP-004', 'LED desk lamp', 24.99, 100, 'Office', 0],
    ];
    for (const p of products) {
      run(
        `INSERT INTO products (name, sku, description, price, quantity, category, is_featured)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        p
      );
    }
    console.log('Seeded sample products');
  }

  const customerCount = queryOne('SELECT COUNT(*) AS c FROM customers')?.c ?? 0;
  if (customerCount === 0) {
    run(
      `INSERT INTO customers (full_name, email, phone, address, city, state, country)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'Jane Doe',
        'jane@example.com',
        '+1-555-0100',
        '123 Main St',
        'Austin',
        'TX',
        'USA',
      ]
    );
    const customerId = lastInsertId();
    run(
      `INSERT INTO orders (customer_id, total_amount, status) VALUES (?, ?, ?)`,
      [customerId, 119.98, 'Completed']
    );
    const orderId = lastInsertId();
    const prod = queryOne('SELECT id, price FROM products WHERE sku = ?', ['WM-001']);
    if (prod) {
      run(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, prod.id, 2, prod.price, Number(prod.price) * 2]
      );
      run(`UPDATE products SET quantity = quantity - 2 WHERE id = ?`, [prod.id]);
    }
    console.log('Seeded sample customer and order');
  }

  saveDb();
}
