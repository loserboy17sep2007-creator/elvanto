"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../supabase";

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  stock: number;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
};

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!id) return;

    loadProduct();
    updateCartCount();
  }, [id]);

  async function loadProduct() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("SUPABASE ERROR:", error);
      setError(error.message);
      setLoading(false);
      return;
    }

    setProduct(data);
    setLoading(false);
  }

  function updateCartCount() {
    const savedCart = localStorage.getItem("elvanto-cart");

    if (!savedCart) {
      setCartCount(0);
      return;
    }

    try {
      const cart: CartItem[] = JSON.parse(savedCart);

      const totalItems = cart.reduce(
        (total, item) => total + Number(item.quantity),
        0
      );

      setCartCount(totalItems);
    } catch {
      setCartCount(0);
    }
  }

  function showMessage(text: string) {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 2500);
  }

  function addToCart(goToCart = false) {
    if (!product) return;

    const stock = Number(product.stock);

    if (stock <= 0) {
      showMessage("This product is out of stock.");
      return;
    }

    if (quantity > stock) {
      showMessage(`Only ${stock} item(s) are available.`);
      setQuantity(stock);
      return;
    }

    const existingCart: CartItem[] = JSON.parse(
      localStorage.getItem("elvanto-cart") || "[]"
    );

    const existingProduct = existingCart.find(
      (item) => item.id === product.id
    );

    if (existingProduct) {
      const newQuantity =
        Number(existingProduct.quantity) + quantity;

      if (newQuantity > stock) {
        showMessage(
          `You can only add ${stock} item(s) of this product.`
        );
        return;
      }

      existingProduct.quantity = newQuantity;
      existingProduct.stock = stock;
    } else {
      existingCart.push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.image,
        quantity: quantity,
        stock: stock,
      });
    }

    localStorage.setItem(
      "elvanto-cart",
      JSON.stringify(existingCart)
    );

    updateCartCount();

    if (goToCart) {
      router.push("/cart");
    } else {
      showMessage(`${product.name} added to cart ✓`);
    }
  }

  function decreaseQuantity() {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  }

  function increaseQuantity() {
    if (!product) return;

    const stock = Number(product.stock);

    if (quantity >= stock) {
      showMessage(`Only ${stock} item(s) are available.`);
      return;
    }

    setQuantity(quantity + 1);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />

          <p className="mt-5 text-gray-500">
            Loading product...
          </p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="max-w-md text-center">
          <div className="text-5xl">×</div>

          <h1 className="mt-5 text-3xl font-bold">
            Product Not Found
          </h1>

          <p className="mt-4 text-sm leading-6 text-gray-500">
            {error || "This product does not exist."}
          </p>

          <Link
            href="/products"
            className="mt-7 inline-block rounded-xl bg-white px-7 py-3 font-semibold text-black transition hover:bg-gray-200"
          >
            BACK TO SHOP
          </Link>
        </div>
      </main>
    );
  }

  const stock = Number(product.stock);
  const price = Number(product.price);
  const totalPrice = price * quantity;

  return (
    <main className="min-h-screen bg-black text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">

          <Link
            href="/"
            className="text-xl font-black tracking-[0.25em] md:text-2xl"
          >
            ELVANTO
          </Link>

          <nav className="flex items-center gap-4 text-sm md:gap-7">

            <Link
              href="/"
              className="hidden transition hover:text-gray-400 md:block"
            >
              Home
            </Link>

            <Link
              href="/products"
              className="transition hover:text-gray-400"
            >
              Shop
            </Link>

            <Link
              href="/cart"
              className="rounded-full border border-white/10 px-4 py-2 transition hover:bg-white hover:text-black"
            >
              🛒 Cart {cartCount > 0 && `(${cartCount})`}
            </Link>

          </nav>
        </div>
      </header>

      {/* MESSAGE */}
      {message && (
        <div className="fixed left-1/2 top-24 z-[100] w-[90%] max-w-md -translate-x-1/2 rounded-xl border border-white/10 bg-white px-5 py-4 text-center font-semibold text-black shadow-2xl">
          {message}
        </div>
      )}

      {/* BREADCRUMB */}
      <div className="mx-auto max-w-7xl px-5 pt-8 md:px-8">
        <Link
          href="/products"
          className="text-sm text-gray-500 transition hover:text-white"
        >
          ← Back to Shop
        </Link>
      </div>

      {/* PRODUCT SECTION */}
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-10 md:grid-cols-2 md:px-8 md:py-16">

        {/* PRODUCT IMAGE */}
        <div>

          <div className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">

            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-[400px] w-full object-cover transition duration-700 group-hover:scale-105 md:h-[600px]"
              />
            ) : (
              <div className="flex h-[400px] items-center justify-center bg-white/[0.05] text-gray-500 md:h-[600px]">
                No Image Available
              </div>
            )}

          </div>

          {/* SMALL PRODUCT INFO */}
          <div className="mt-5 grid grid-cols-3 gap-3">

            <div className="rounded-xl border border-white/10 p-4 text-center">
              <p className="text-lg">✓</p>

              <p className="mt-2 text-xs text-gray-500">
                Quality
              </p>
            </div>

            <div className="rounded-xl border border-white/10 p-4 text-center">
              <p className="text-lg">↗</p>

              <p className="mt-2 text-xs text-gray-500">
                Easy Order
              </p>
            </div>

            <div className="rounded-xl border border-white/10 p-4 text-center">
              <p className="text-lg">∞</p>

              <p className="mt-2 text-xs text-gray-500">
                Everyday Use
              </p>
            </div>

          </div>
        </div>

        {/* PRODUCT DETAILS */}
        <div className="flex flex-col justify-center">

          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
            {product.category}
          </p>

          <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
            {product.name}
          </h1>

          {/* PRICE + STOCK */}
          <div className="mt-6 flex flex-wrap items-center gap-4">

            <p className="text-3xl font-bold">
              Rs. {price.toFixed(2)}
            </p>

            <span
              className={`rounded-full border px-3 py-1 text-xs ${
                stock > 0
                  ? "border-green-500/30 text-green-400"
                  : "border-red-500/30 text-red-400"
              }`}
            >
              {stock > 0
                ? `${stock} in stock`
                : "Out of stock"}
            </span>

          </div>

          <div className="my-8 h-px bg-white/10" />

          {/* DESCRIPTION */}
          <p className="text-base leading-8 text-gray-400">
            {product.description ||
              "No description available."}
          </p>

          {/* QUANTITY */}
          <div className="mt-9">

            <p className="mb-3 text-sm font-semibold">
              Quantity
            </p>

            <div className="flex w-fit items-center overflow-hidden rounded-xl border border-white/15">

              <button
                onClick={decreaseQuantity}
                disabled={quantity <= 1 || stock <= 0}
                className="px-5 py-3 text-xl transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                −
              </button>

              <span className="min-w-14 text-center font-semibold">
                {quantity}
              </span>

              <button
                onClick={increaseQuantity}
                disabled={quantity >= stock || stock <= 0}
                className="px-5 py-3 text-xl transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                +
              </button>

            </div>

            {stock > 0 && (
              <p className="mt-3 text-xs text-gray-600">
                Maximum available: {stock}
              </p>
            )}

          </div>

          {/* TOTAL */}
          <div className="mt-7 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">

            <span className="text-sm text-gray-500">
              Total
            </span>

            <span className="text-xl font-bold">
              Rs. {totalPrice.toFixed(2)}
            </span>

          </div>

          {/* BUTTONS */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">

            <button
              onClick={() => addToCart(false)}
              disabled={stock <= 0}
              className={`rounded-xl border px-6 py-4 font-bold transition ${
                stock > 0
                  ? "border-white/20 hover:bg-white/10"
                  : "cursor-not-allowed border-white/10 opacity-40"
              }`}
            >
              {stock > 0
                ? "ADD TO CART"
                : "OUT OF STOCK"}
            </button>

            <button
              onClick={() => addToCart(true)}
              disabled={stock <= 0}
              className={`rounded-xl px-6 py-4 font-bold transition ${
                stock > 0
                  ? "bg-white text-black hover:bg-gray-200"
                  : "cursor-not-allowed bg-gray-700 text-gray-400"
              }`}
            >
              {stock > 0
                ? "BUY NOW →"
                : "OUT OF STOCK"}
            </button>

          </div>

          {/* BENEFITS */}
          <div className="mt-8 space-y-4 border-t border-white/10 pt-7">

            <div className="flex gap-4">
              <span>✓</span>

              <div>
                <p className="text-sm font-semibold">
                  Simple ordering
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Add products to your cart in seconds.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span>✓</span>

              <div>
                <p className="text-sm font-semibold">
                  Secure checkout
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Complete your order through our checkout.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span>✓</span>

              <div>
                <p className="text-sm font-semibold">
                  Easy tracking
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Track your order after placing it.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* DESCRIPTION SECTION */}
      <section className="border-y border-white/10 bg-white/[0.02]">

        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">

          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
            PRODUCT DETAILS
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            About this product
          </h2>

          <p className="mt-6 max-w-3xl leading-8 text-gray-400">
            {product.description ||
              "No description available."}
          </p>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-10 text-center">

        <Link
          href="/"
          className="text-xl font-black tracking-[0.25em]"
        >
          ELVANTO
        </Link>

        <p className="mt-3 text-sm text-gray-600">
          Smart. Stylish. Simple.
        </p>

        <p className="mt-5 text-xs text-gray-700">
          © 2026 ELVANTO. All rights reserved.
        </p>

      </footer>

    </main>
  );
}