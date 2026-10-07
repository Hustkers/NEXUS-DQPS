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

export type ProductFilters = {
  page?: number;
  limit?: number;
  categories?: string;
  search?: string;
  sort?: string;
};

export type ProductsResponse = {
  success: boolean;
  time: string;
  message: string;
  total_products: number;
  offset: number;
  limit: number;
  products: Product[];
};

export type ProductByIdResponse = {
  success: boolean;
  time: string;
  message: string;
  product: Product;
};

export type ProductMutationPayload = {
  name: string;
  category: string;
  price: number;
  description: string;
};
