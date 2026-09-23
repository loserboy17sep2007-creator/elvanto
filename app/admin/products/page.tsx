"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../supabase";

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  stock: number;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("General");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [stock, setStock] = useState("");

  useEffect(() => {
    checkAdminAndLoadProducts();
  }, []);

  // =========================
  // CHECK ADMIN
  // =========================

  async function checkAdminAndLoadProducts() {
    setLoading(true);
    setMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setMessage("Please login first.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      setMessage("Access denied. Admin account required.");
      setLoading(false);
      return;
    }

    await loadProducts();

    setLoading(false);
  }

  // =========================
  // LOAD PRODUCTS
  // =========================

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setProducts(data || []);
  }

  // =========================
  // RESET FORM
  // =========================

  function resetForm() {
    setName("");
    setPrice("");
    setCategory("General");
    setDescription("");
    setImage("");
    setStock("");
    setEditingId(null);
  }

  // =========================
  // EDIT PRODUCT
  // =========================

  function editProduct(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setPrice(String(product.price));
    setCategory(product.category || "General");
    setDescription(product.description || "");
    setImage(product.image || "");
    setStock(String(product.stock ?? 0));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =========================
  // UPLOAD IMAGE
  // =========================

  async function uploadImage(file: File) {
    if (!file) return;

    setMessage("");
    setUploading(true);

    try {
      if (!file.type.startsWith("image/")) {
        setMessage("Please select an image file.");
        setUploading(false);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setMessage("Image must be smaller than 5MB.");
        setUploading(false);
        return;
      }

      const fileExtension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const uniqueFileName =
        `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 8)}` +
        `.${fileExtension}`;

      const filePath = `products/${uniqueFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        setMessage(uploadError.message);
        setUploading(false);
        return;
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      setImage(data.publicUrl);

      setMessage("Image uploaded successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Image upload failed.");
    }

    setUploading(false);
  }

  // =========================
  // SAVE PRODUCT
  // =========================

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();

    setMessage("");

    if (!name.trim()) {
      setMessage("Product name is required.");
      return;
    }

    if (!price || Number(price) < 0) {
      setMessage("Enter a valid price.");
      return;
    }

    if (stock === "" || Number(stock) < 0) {
      setMessage("Enter a valid stock quantity.");
      return;
    }

    if (!image) {
      setMessage("Please upload a product image.");
      return;
    }

    setSaving(true);

    try {
      // =========================
      // UPDATE PRODUCT
      // =========================

      if (editingId) {
        const updatedProduct = {
          name: name.trim(),
          price: Number(price),
          category: category.trim() || "General",
          description: description.trim(),
          image: image,
          stock: Number(stock),
        };

        const { error } = await supabase
          .from("products")
          .update(updatedProduct)
          .eq("id", editingId);

        if (error) {
          setMessage(error.message);
          setSaving(false);
          return;
        }

        setMessage("Product updated successfully.");

        resetForm();

        await loadProducts();

        setSaving(false);

        return;
      }

      // =========================
      // CREATE UNIQUE ID
      // =========================

      const newProductId =
        "PROD-" +
        Date.now().toString() +
        "-" +
        Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();

      // =========================
      // NEW PRODUCT
      // =========================

      const newProduct = {
        id: newProductId,
        name: name.trim(),
        price: Number(price),
        category: category.trim() || "General",
        description: description.trim(),
        image: image,
        stock: Number(stock),
      };

      // =========================
      // INSERT PRODUCT
      // =========================

      const { error } = await supabase
        .from("products")
        .insert([newProduct]);

      if (error) {
        setMessage(error.message);
        setSaving(false);
        return;
      }

      setMessage(
        `Product added successfully. ID: ${newProductId}`
      );

      resetForm();

      await loadProducts();
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while saving the product.");
    }

    setSaving(false);
  }

  // =========================
  // DELETE PRODUCT
  // =========================

  async function deleteProduct(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    setMessage("");

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Product deleted successfully.");

    await loadProducts();
  }

  // =========================
  // LOADING
  // =========================

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
        <h1
          style={{
            color: "#111827",
          }}
        >
          Loading Admin Products...
        </h1>
      </main>
    );
  }

  // =========================
  // MAIN PAGE
  // =========================

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
        {/* =========================
            HEADER
        ========================= */}

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
              color: "#ffffff",
              fontSize: "30px",
            }}
          >
            ELVANTO Admin Products
          </h1>

          <p
            style={{
              marginTop: "8px",
              marginBottom: 0,
              color: "#e5e7eb",
              fontSize: "16px",
            }}
          >
            Manage products, prices, stock and images.
          </p>
        </div>

        {/* =========================
            MESSAGE
        ========================= */}

        {message && (
          <div
            style={{
              background: "#ffffff",
              color: "#111827",
              border: "1px solid #d1d5db",
              padding: "15px",
              borderRadius: "10px",
              marginBottom: "20px",
              fontWeight: "700",
            }}
          >
            {message}
          </div>
        )}

        {/* =========================
            ADD PRODUCT FORM
        ========================= */}

        <section
          style={{
            background: "#ffffff",
            padding: "25px",
            borderRadius: "16px",
            marginBottom: "30px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "25px",
              color: "#111827",
            }}
          >
            {editingId ? "Edit Product" : "Add New Product"}
          </h2>

          <form onSubmit={saveProduct}>
            {/* PRODUCT BASIC INFO */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "18px",
              }}
            >
              {/* NAME */}

              <div>
                <label style={labelStyle}>
                  Product Name
                </label>

                <input
                  type="text"
                  placeholder="Enter product name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  style={inputStyle}
                />
              </div>

              {/* PRICE */}

              <div>
                <label style={labelStyle}>
                  Price
                </label>

                <input
                  type="number"
                  placeholder="Enter price"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value)
                  }
                  style={inputStyle}
                />
              </div>

              {/* CATEGORY */}

              <div>
                <label style={labelStyle}>
                  Category
                </label>

                <input
                  type="text"
                  placeholder="Electronics"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  style={inputStyle}
                />
              </div>

              {/* STOCK */}

              <div>
                <label style={labelStyle}>
                  Stock
                </label>

                <input
                  type="number"
                  placeholder="Stock quantity"
                  value={stock}
                  onChange={(e) =>
                    setStock(e.target.value)
                  }
                  style={inputStyle}
                />
              </div>
            </div>

            {/* =========================
                IMAGE
            ========================= */}

            <div
              style={{
                marginTop: "22px",
              }}
            >
              <label style={labelStyle}>
                Product Image
              </label>

              <div
                style={{
                  border: "2px dashed #9ca3af",
                  borderRadius: "12px",
                  padding: "25px",
                  textAlign: "center",
                  background: "#f9fafb",
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const selectedFile =
                      e.target.files?.[0];

                    if (selectedFile) {
                      uploadImage(selectedFile);
                    }
                  }}
                  style={{
                    color: "#111827",
                    fontSize: "15px",
                  }}
                />

                {uploading && (
                  <p
                    style={{
                      color: "#111827",
                      fontWeight: "700",
                      marginTop: "15px",
                    }}
                  >
                    Uploading image...
                  </p>
                )}

                {image && (
                  <div
                    style={{
                      marginTop: "20px",
                    }}
                  >
                    <p
                      style={{
                        color: "#166534",
                        fontWeight: "700",
                      }}
                    >
                      Image uploaded ✓
                    </p>

                    <img
                      src={image}
                      alt="Product preview"
                      style={{
                        width: "240px",
                        height: "180px",
                        objectFit: "cover",
                        borderRadius: "10px",
                        border: "1px solid #d1d5db",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* =========================
                DESCRIPTION
            ========================= */}

            <div
              style={{
                marginTop: "22px",
              }}
            >
              <label style={labelStyle}>
                Product Description
              </label>

              <textarea
                placeholder="Enter product description"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                style={{
                  ...inputStyle,
                  minHeight: "130px",
                  resize: "vertical",
                }}
              />
            </div>

            {/* =========================
                FORM BUTTONS
            ========================= */}

            <div
              style={{
                marginTop: "22px",
              }}
            >
              <button
                type="submit"
                disabled={saving || uploading}
                style={{
                  ...primaryButton,
                  opacity:
                    saving || uploading ? 0.6 : 1,
                }}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Product"
                  : "Add Product"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={secondaryButton}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        {/* =========================
            PRODUCT LIST
        ========================= */}

        <section
          style={{
            background: "#ffffff",
            padding: "25px",
            borderRadius: "16px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: "#111827",
            }}
          >
            All Products ({products.length})
          </h2>

          {products.length === 0 ? (
            <div
              style={{
                padding: "35px",
                textAlign: "center",
                background: "#f9fafb",
                borderRadius: "10px",
                color: "#374151",
              }}
            >
              No products found.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "20px",
                marginTop: "20px",
              }}
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  style={{
                    border: "1px solid #d1d5db",
                    borderRadius: "14px",
                    overflow: "hidden",
                    background: "#ffffff",
                  }}
                >
                  {/* IMAGE */}

                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "210px",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        height: "210px",
                        background: "#e5e7eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#374151",
                        fontWeight: "700",
                      }}
                    >
                      No Image
                    </div>
                  )}

                  {/* INFO */}

                  <div
                    style={{
                      padding: "18px",
                    }}
                  >
                    <h3
                      style={{
                        marginTop: 0,
                        marginBottom: "12px",
                        color: "#111827",
                        fontSize: "20px",
                      }}
                    >
                      {product.name}
                    </h3>

                    <p style={productTextStyle}>
                      <strong>Product ID:</strong>{" "}
                      {product.id}
                    </p>

                    <p style={productTextStyle}>
                      <strong>Price:</strong>{" "}
                      Rs.{" "}
                      {Number(product.price).toFixed(2)}
                    </p>

                    <p style={productTextStyle}>
                      <strong>Category:</strong>{" "}
                      {product.category}
                    </p>

                    <p style={productTextStyle}>
                      <strong>Stock:</strong>{" "}
                      <span
                        style={{
                          color:
                            product.stock > 0
                              ? "#166534"
                              : "#b91c1c",
                          fontWeight: "700",
                        }}
                      >
                        {product.stock}
                      </span>
                    </p>

                    <p
                      style={{
                        color: "#374151",
                        lineHeight: "1.6",
                        minHeight: "50px",
                      }}
                    >
                      {product.description ||
                        "No description"}
                    </p>

                    {/* BUTTONS */}

                    <div
                      style={{
                        marginTop: "18px",
                      }}
                    >
                      <button
                        onClick={() =>
                          editProduct(product)
                        }
                        style={primaryButton}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteProduct(product.id)
                        }
                        style={{
                          ...deleteButton,
                          marginLeft: "8px",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/* =========================
   STYLES
========================= */

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  color: "#111827",
  fontWeight: "700",
  fontSize: "14px",
};

const inputStyle = {
  width: "100%",
  padding: "13px",
  border: "1px solid #9ca3af",
  borderRadius: "8px",
  fontSize: "15px",
  boxSizing: "border-box" as const,
  color: "#111827",
  background: "#ffffff",
  outline: "none",
};

const productTextStyle = {
  color: "#1f2937",
  margin: "8px 0",
  fontSize: "14px",
  wordBreak: "break-word" as const,
};

const primaryButton = {
  padding: "12px 20px",
  background: "#111827",
  color: "#ffffff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "14px",
};

const secondaryButton = {
  padding: "12px 20px",
  background: "#6b7280",
  color: "#ffffff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "14px",
  marginLeft: "10px",
};

const deleteButton = {
  padding: "12px 20px",
  background: "#dc2626",
  color: "#ffffff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "14px",
};