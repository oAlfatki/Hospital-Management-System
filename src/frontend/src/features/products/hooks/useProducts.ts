import { useQuery } from "@tanstack/react-query";
import { ProductService } from "../services/productService";
import type { Product } from "../types/product";


export function useProducts() {

    return useQuery<Product[]>({
        
        queryKey: ["products"],
        queryFn: ProductService.getAll

    });

}