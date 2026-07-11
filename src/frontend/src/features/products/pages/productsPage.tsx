import { useProducts } from "../hooks/useProducts";
import type { Product } from "../types/product";

export default function ProductsPage() {

    
  const {data: products,isLoading,error,} = useProducts();

  if (isLoading) {
    return <h2>Loading products...</h2>;
  }

  console.log("Products:", products);


  if (error) {
    return <h2 style={{ color: "red" }}>{error.message}</h2>;
  }

  if (!products || products.length === 0) {
    return <h2>No products found.</h2>;
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>Products</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {products.map((product: Product) => (
          <div
            key={`product-N:${product.id} `}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "15px",
              boxShadow: "0 2px 8px rgba(0,0,0,.1)",
            }}
          >
            

            <h3>{`T:${product.title}`}</h3>

            <p>
              <strong>Category:</strong> {product.category}
            </p>

            <p>
              <strong>Price:</strong> ${product.price}
            </p>

            <p>
              {product.description.length > 100
                ? product.description.substring(0, 100) + "..."
                : product.description}
            </p>

            <button
              style={{
                width: "100%",
                padding: "10px",
                cursor: "pointer",
              }}
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}