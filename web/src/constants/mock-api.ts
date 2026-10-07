////////////////////////////////////////////////////////////////////////////////
// Postgres-backed / Nike Footwear Product Store
////////////////////////////////////////////////////////////////////////////////

import { query } from '@/lib/db';
import nikeProductsBackup from '@/data/nike-products.json';
import { matchSorter } from 'match-sorter';

// Shape of Product data
export type Product = {
  id: number;
  sku?: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  sale_price_inr?: number;
  listing_price_inr?: number;
  discount_pct?: number;
  rating?: number;
  reviews?: number;
  photo_url: string;
  images?: string[];
  category: string;
  updated_at: string;
};

export const fakeProducts = {
  records: nikeProductsBackup as unknown as Product[],

  // Get all products directly from PostgreSQL with JSON fallback
  async getAll({ categories = [], search }: { categories?: string[]; search?: string }) {
    try {
      let sql = `
        SELECT
          id,
          product_id as sku,
          product_name as name,
          description,
          created_at,
          price_usd as price,
          sale_price as sale_price_inr,
          listing_price as listing_price_inr,
          discount_pct,
          rating,
          reviews,
          photo_url,
          images,
          category,
          updated_at
        FROM products
        WHERE 1=1
      `;
      const params: any[] = [];

      if (categories && categories.length > 0) {
        params.push(categories);
        sql += ` AND category = ANY($${params.length})`;
      }

      if (search && search.trim()) {
        params.push(`%${search.trim().toLowerCase()}%`);
        sql += ` AND (LOWER(product_name) LIKE $${params.length} OR LOWER(product_id) LIKE $${params.length} OR LOWER(category) LIKE $${params.length})`;
      }

      sql += ` ORDER BY reviews DESC, rating DESC`;

      const rows = await query(sql, params);
      if (rows && rows.length > 0) {
        return rows.map((r: any) => ({
          ...r,
          id: Number(r.id),
          price: Number(r.price),
          rating: Number(r.rating),
          reviews: Number(r.reviews),
          created_at: new Date(r.created_at).toISOString(),
          updated_at: new Date(r.updated_at).toISOString(),
          images: Array.isArray(r.images) ? r.images : (typeof r.images === 'string' ? JSON.parse(r.images) : [])
        }));
      }
    } catch (e) {
      console.warn('PostgreSQL fetch fallback to local Nike catalog:', e);
    }

    // Fallback to local 353 Nike catalog if postgres connection is unavailable
    let products = [...this.records];
    if (categories.length > 0) {
      products = products.filter((product) => categories.includes(product.category));
    }
    if (search) {
      products = matchSorter(products, search, {
        keys: ['name', 'description', 'category', 'sku']
      });
    }
    return products;
  },

  // Get paginated results with optional category filtering, search, and sorting
  async getProducts({
    page = 1,
    limit = 10,
    categories,
    search,
    sort
  }: {
    page?: number;
    limit?: number;
    categories?: string | string[];
    search?: string;
    sort?: string;
  }) {
    const categoriesArray = categories
      ? Array.isArray(categories)
        ? categories
        : String(categories).split(/[.,]/)
      : [];

    const allProducts = await this.getAll({
      categories: categoriesArray,
      search
    });

    // Sorting
    if (sort) {
      try {
        const sortItems = JSON.parse(sort) as {
          id: string;
          desc: boolean;
        }[];
        if (sortItems.length > 0) {
          const { id, desc } = sortItems[0];
          allProducts.sort((a, b) => {
            const aVal = (a as Record<string, unknown>)[id];
            const bVal = (b as Record<string, unknown>)[id];
            if (typeof aVal === 'number' && typeof bVal === 'number') {
              return desc ? bVal - aVal : aVal - bVal;
            }
            const aStr = String(aVal ?? '').toLowerCase();
            const bStr = String(bVal ?? '').toLowerCase();
            return desc ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr);
          });
        }
      } catch {
        // Invalid sort param — ignore
      }
    }

    const totalProducts = allProducts.length;
    const offset = (page - 1) * limit;
    const paginatedProducts = allProducts.slice(offset, offset + limit);

    return {
      success: true,
      time: new Date().toISOString(),
      message: 'Nike Direct D2C Footwear Catalog (PostgreSQL 16)',
      total_products: totalProducts,
      offset,
      limit,
      products: paginatedProducts
    };
  },

  // Get a specific product by its ID
  async getProductById(id: number) {
    try {
      const rows = await query(
        `SELECT
          id, product_id as sku, product_name as name, description, created_at,
          price_usd as price, sale_price as sale_price_inr, listing_price as listing_price_inr,
          discount_pct, rating, reviews, photo_url, images, category, updated_at
         FROM products WHERE id = $1`,
        [id]
      );
      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          success: true,
          time: new Date().toISOString(),
          message: `Product with ID ${id} found`,
          product: {
            ...r,
            id: Number(r.id),
            price: Number(r.price),
            rating: Number(r.rating),
            reviews: Number(r.reviews),
            created_at: new Date(r.created_at).toISOString(),
            updated_at: new Date(r.updated_at).toISOString(),
            images: Array.isArray(r.images) ? r.images : (typeof r.images === 'string' ? JSON.parse(r.images) : [])
          }
        };
      }
    } catch (e) {
      console.warn('PostgreSQL single product fetch error, fallback:', e);
    }

    const product = this.records.find((product) => product.id === id);
    if (!product) {
      return {
        success: false,
        message: `Product with ID ${id} not found`
      };
    }
    return {
      success: true,
      time: new Date().toISOString(),
      message: `Product with ID ${id} found`,
      product
    };
  },

  // Create a new product
  async createProduct(data: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'photo_url'>) {
    const sku = `NIKE-${Date.now().toString().slice(-6)}`;
    const photoUrl = 'https://static.nike.com/a/images/t_PDP_1728_v1/ccsubyw6lzx10virtjdu/air-jordan-10-retro-shoe-f3jBkN.jpg';
    try {
      const rows = await query(
        `INSERT INTO products (
          product_id, product_name, brand, category, sale_price, price_usd, description, photo_url
        ) VALUES ($1, $2, 'Nike', $3, $4, $5, $6, $7)
        RETURNING id, product_id as sku, product_name as name, description, created_at, price_usd as price, category, photo_url, updated_at`,
        [sku, data.name, data.category, data.price * 83, data.price, data.description, photoUrl]
      );
      if (rows && rows.length > 0) {
        return {
          success: true,
          message: 'Product created successfully in PostgreSQL',
          product: rows[0]
        };
      }
    } catch (e) {
      console.warn('PostgreSQL createProduct error, fallback to memory:', e);
    }

    const newProduct: Product = {
      ...data,
      id: this.records.length + 1,
      sku,
      photo_url: photoUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.records.push(newProduct);
    return {
      success: true,
      message: 'Product created successfully',
      product: newProduct
    };
  },

  // Update an existing product
  async updateProduct(
    id: number,
    data: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'photo_url'>
  ) {
    try {
      await query(
        `UPDATE products SET
          product_name = $1, category = $2, price_usd = $3, sale_price = $4, description = $5, updated_at = CURRENT_TIMESTAMP
         WHERE id = $6`,
        [data.name, data.category, data.price, data.price * 83, data.description, id]
      );
    } catch (e) {
      console.warn('PostgreSQL updateProduct error:', e);
    }

    const index = this.records.findIndex((product) => product.id === id);
    if (index !== -1) {
      this.records[index] = {
        ...this.records[index],
        ...data,
        updated_at: new Date().toISOString()
      };
      return {
        success: true,
        message: 'Product updated successfully',
        product: this.records[index]
      };
    }
    return { success: false, message: `Product with ID ${id} not found` };
  },

  // Delete a product
  async deleteProduct(id: number) {
    try {
      await query(`DELETE FROM products WHERE id = $1`, [id]);
    } catch (e) {
      console.warn('PostgreSQL deleteProduct error:', e);
    }

    const index = this.records.findIndex((product) => product.id === id);
    if (index === -1) {
      return { success: false, message: `Product with ID ${id} not found` };
    }
    this.records.splice(index, 1);
    return {
      success: true,
      message: 'Product deleted successfully'
    };
  }
};
