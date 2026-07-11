import { ProductApi } from "../api/productsApi";
import type { Product } from "../types/product";


export class ProductService {

    static async getAll(): Promise<Product[]> {

        const products = await ProductApi.getAll();

        return products;

    }

}