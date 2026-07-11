import axiosInstance from "../../../core/config/axios";
import type { Product } from "../types/product";

export class ProductApi {
  static async getAll(): Promise<Product[]> {
    try {
      interface ProductsResponse {
        products: Product[];
        total: number;
        skip: number;
        limit: number;
      }

      const response = await axiosInstance.get<ProductsResponse>("/products");

      return response.data.products;
      
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }
}
