import { apiClient } from '@/lib/api-client';
import type {
  ProductFilters,
  ProductsResponse,
  ProductByIdResponse,
  ProductMutationPayload
} from './types';

export async function getProducts(filters: ProductFilters): Promise<ProductsResponse> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.categories) params.set('categories', filters.categories);
  if (filters.search) params.set('search', filters.search);
  if (filters.sort) params.set('sort', filters.sort);

  const queryStr = params.toString() ? `?${params.toString()}` : '';
  return apiClient<ProductsResponse>(`/products${queryStr}`);
}

export async function getProductById(id: number): Promise<ProductByIdResponse> {
  return apiClient<ProductByIdResponse>(`/products/${id}`);
}

export async function createProduct(data: ProductMutationPayload) {
  return apiClient<any>('/products', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateProduct(id: number, data: ProductMutationPayload) {
  return apiClient<any>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteProduct(id: number) {
  return apiClient<any>(`/products/${id}`, {
    method: 'DELETE'
  });
}
