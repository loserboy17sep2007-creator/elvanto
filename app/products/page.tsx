"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../supabase";

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  stock: number;
};

type CartItem = Product & {
  quantity: number;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      setError(error.message);
      setLoading(false);
      return;
    }

    setProducts(data || []);
    setLoading(false);
  }

  function addToCart(product: Product) {
    if (product.stock <= 0) {
      setMessage("This product is out of stock.");
      return;
    }

    const existingCart: CartItem[] = JSON.parse(
      localStorage.getItem("elvanto-cart") || "[]"
    );

    const existingProduct = existingCart.find(
      (item) => item.id === product.id
    );

    let updatedCart: CartItem[];

    if (existingProduct) {
      if (existingProduct.quantity >= product.stock) {
        setMessage("You cannot add more than available stock.");
        return;
      }

      updatedCart = existingCart.map((item) =>
        item.id === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      );
    } else {
      updatedCart = [
        ...existingCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    }

    localStorage.setItem(
      "elvanto-cart",
      JSON.stringify(updatedCart)
    );

    setMessage(`${product.name} added to cart ✓`);

    setTimeout(() => {
      setMessage("");
    }, 2500);
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f3f4f6",
          padding: "40px",
          fontFamily: "Arial, sans-serif",
          color: "#111827",
        }}
      >
        <h1>Loading Products...</h1>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
        color: "#111827",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#111827",
            color: "#ffffff",
            padding: "30px",
            borderRadius: "16px",
            marginBottom: "25px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
            }}
          >
            ELVANTO Products
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#d1d5db",
            }}
          >
            Discover our latest products.
          </p>
        </div>

        {/* Success Message */}
        {message && (
          <div
            style={{
              background: "#dcfce7",
              color: "#166534",
              padding: "15px",
              borderRadius: "10px",
              marginBottom: "20px",
              fontWeight: "700",
              border: "1px solid #86efac",
            }}
          >
            {message}
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: "15px",
              borderRadius: "10px",
              marginBottom: "20px",
              fontWeight: "700",
            }}
          >
            Error: {error}
          </div>
        )}

        {/* Products */}
        {products.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              padding: "40px",
              borderRadius: "15px",
              textAlign: "center",
            }}
          >
            <h2>No products available</h2>
            <p>Products will appear here when they are added.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "25px",
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                style={{
                  background: "#ffffff",
                  borderRadius: "15px",
                  overflow: "hidden",
                  border: "1px solid #e5e7eb",
                  boxShadow:
                    "0 4px 15px rgba(0,0,0,0.08)",
                }}
              >
                {/* Product Image */}
                <Link
                  href={`/products/${product.id}`}
                  style={{
                    display: "block",
                    textDecoration: "none",
                  }}
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "230px",
                        objectFit: "cover",
                        display: "block",
                        cursor: "pointer",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        height: "230px",
                        background: "#e5e7eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#374151",
                      }}
                    >
                      No Image
                    </div>
                  )}
                </Link>

                <div style={{ padding: "20px" }}>
                  {/* Category */}
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "14px",
                      marginBottom: "8px",
                    }}
                  >
                    {product.category}
                  </p>

                  {/* Product Name */}
                  <Link
                    href={`/products/${product.id}`}
                    style={{
                      textDecoration: "none",
                      color: "#111827",
                    }}
                  >
                    <h2
                      style={{
                        margin: "0 0 10px",
                        color: "#111827",
                        cursor: "pointer",
                      }}
                    >
                      {product.name}
                    </h2>
                  </Link>

                  {/* Description */}
                  <Link
                    href={`/products/${product.id}`}
                    style={{
                      textDecoration: "none",
                    }}
                  >
                    <p
                      style={{
                        color: "#374151",
                        lineHeight: "1.6",
                        minHeight: "50px",
                        cursor: "pointer",
                      }}
                    >
                      {product.description ||
                        "No description available."}
                    </p>
                  </Link>

                  {/* Price + Stock */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "18px",
                      gap: "10px",
                    }}
                  >
                    <strong
                      style={{
                        fontSize: "22px",
                        color: "#111827",
                      }}
                    >
                      Rs. {Number(product.price).toFixed(2)}
                    </strong>

                    <span
                      style={{
                        fontWeight: "700",
                        color:
                          product.stock > 0
                            ? "#166534"
                            : "#b91c1c",
                      }}
                    >
                      {product.stock > 0
                        ? `${product.stock} in stock`
                        : "Out of stock"}
                    </span>
                  </div>

                  {/* View Details */}
                  <Link
                    href={`/products/${product.id}`}
                    style={{
                      display: "block",
                      width: "100%",
                      marginTop: "18px",
                      padding: "13px",
                      borderRadius: "8px",
                      background: "#e5e7eb",
                      color: "#111827",
                      fontWeight: "700",
                      textAlign: "center",
                      textDecoration: "none",
                      boxSizing: "border-box",
                    }}
                  >
                    View Details
                  </Link>

                  {/* Add To Cart */}
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock <= 0}
                    style={{
                      width: "100%",
                      marginTop: "10px",
                      padding: "13px",
                      border: "none",
                      borderRadius: "8px",
                      background:
                        product.stock > 0
                          ? "#111827"
                          : "#9ca3af",
                      color: "#ffffff",
                      fontWeight: "700",
                      cursor:
                        product.stock > 0
                          ? "pointer"
                          : "not-allowed",
                    }}
                  >
                    {product.stock > 0
                      ? "Add to Cart"
                      : "Out of Stock"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}