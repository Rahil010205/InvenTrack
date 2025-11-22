'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getProducts() {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.category_id 
      ORDER BY p.created_at DESC
    `);
    return rows;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export async function createProduct(formData) {
  const name = formData.get('name');
  const sku = formData.get('sku');
  const category_id = formData.get('category_id') || null;
  const unit = formData.get('unit');
  const reorder_level = formData.get('reorder_level') || 0;

  try {
    await pool.query(
      'INSERT INTO products (name, sku, category_id, unit, reorder_level) VALUES (?, ?, ?, ?, ?)',
      [name, sku, category_id, unit, reorder_level]
    );
  } catch (error) {
    console.error('Failed to create product:', error);
    return { message: 'Failed to create product' };
  }

  revalidatePath('/products');
  redirect('/products');
}

export async function getCategories() {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
    return rows;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}
