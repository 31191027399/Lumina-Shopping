import fs from 'node:fs';
import path from 'node:path';
import sqlite3 from 'sqlite3';
import { config } from './config.js';

sqlite3.verbose();

const dbDir = path.dirname(config.dbFile);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new sqlite3.Database(config.dbFile);

export function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      return resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

export function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      return resolve(row);
    });
  });
}

export function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      return resolve(rows);
    });
  });
}

const productSeeds = [
  {
    id: 1,
    name: 'Premium Wireless Headphones',
    price: 299.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    rating: 4.8,
    reviews: 124,
    description: 'Experience studio-quality sound with our flagship wireless headphones featuring active noise cancellation.'
  },
  {
    id: 2,
    name: 'Minimalist Leather Watch',
    price: 149,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    rating: 4.6,
    reviews: 89,
    description: 'A timeless design that complements any outfit. Crafted with genuine Italian leather.'
  },
  {
    id: 3,
    name: 'Smart Fitness Tracker',
    price: 89.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80',
    rating: 4.5,
    reviews: 210,
    description: 'Track your steps, heart rate, and sleep quality with 24/7 precision.'
  },
  {
    id: 4,
    name: 'Eco-Friendly Yoga Mat',
    price: 55,
    category: 'Fitness',
    image: 'https://images.unsplash.com/photo-1592432676556-28453d078add?w=800&q=80',
    rating: 4.9,
    reviews: 56,
    description: 'Non-slip surface made from sustainable natural rubber for the perfect flow.'
  },
  {
    id: 5,
    name: 'Ceramic Coffee Set',
    price: 45,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1517254456976-ee8682099819?w=800&q=80',
    rating: 4.7,
    reviews: 42,
    description: 'Hand-crafted ceramic set including two mugs and a matching pour-over dripper.'
  },
  {
    id: 6,
    name: 'Canvas Weekend Bag',
    price: 120,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    rating: 4.4,
    reviews: 33,
    description: 'Durable water-resistant canvas with leather accents. Perfect for short getaways.'
  },
  {
    id: 7,
    name: 'Mechanical Gaming Keyboard',
    price: 175,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&q=80',
    rating: 4.8,
    reviews: 156,
    description: 'Tactile switches and customizable RGB lighting for the ultimate gaming experience.'
  },
  {
    id: 8,
    name: 'Organic Cotton Hoodie',
    price: 65,
    category: 'Apparel',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
    rating: 4.6,
    reviews: 92,
    description: 'Ultra-soft sustainable cotton blend. Designed for comfort and durability.'
  }
];

export async function initDb() {
  await run('PRAGMA foreign_keys = ON');

  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      image TEXT NOT NULL,
      rating REAL NOT NULL,
      reviews INTEGER NOT NULL,
      description TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS cart_items (
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      subtotal REAL NOT NULL,
      shipping REAL NOT NULL,
      total REAL NOT NULL,
      shipping_address TEXT,
      payment_method TEXT,
      status TEXT NOT NULL DEFAULT 'PLACED',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      product_category TEXT NOT NULL,
      unit_price REAL NOT NULL,
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      total_price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
    )
  `);

  const hasProducts = await get('SELECT id FROM products LIMIT 1');
  if (!hasProducts) {
    for (const product of productSeeds) {
      await run(
        `INSERT INTO products (id, name, price, category, image, rating, reviews, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product.id,
          product.name,
          product.price,
          product.category,
          product.image,
          product.rating,
          product.reviews,
          product.description
        ]
      );
    }
  }
}
