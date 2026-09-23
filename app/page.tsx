"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../supabase";

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
};

const categories = [
  {
    name: "Tech & Gadgets",
    icon: "⌁",
    description: "Smart tech for modern life.",
  },
  {
    name: "Home & Living",
    icon: "⌂",
    description: "Simple upgrades for your home.",
  },
  {
    name: "Beauty & Accessories",
    icon: "✦",
    description: "Everyday style and essentials.",
  },
  {
    name: "Travel",
    icon: "✈",
    description: "Travel smarter and lighter.",
  },
  {
    name: "Pet Essentials",
    icon: "♡",
    description: "Useful picks for your pets.",
  },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      setProducts((data || []) as Product[]);
      setLoading(false);
    };

    loadProducts();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">

          <Link
            href="/"
            className="text-xl font-black tracking-[0.25em] md:text-2xl"
          >
            ELVANTO
          </Link>

          <nav className="hidden items-center gap-7 text-sm md:flex">
            <Link href="/" className="transition hover:text-gray-400">
              Home
            </Link>

            <Link href="/products" className="transition hover:text-gray-400">
              Shop
            </Link>

            <Link href="/products" className="transition hover:text-gray-400">
              Categories
            </Link>

            <Link href="/products" className="transition hover:text-gray-400">
              About
            </Link>

            <Link href="/products" className="transition hover:text-gray-400">
              Contact
            </Link>

            <Link
              href="/cart"
              className="rounded-full border border-white/10 px-4 py-2 transition hover:bg-white hover:text-black"
            >
              🛒 Cart
            </Link>
          </nav>

          <Link
            href="/cart"
            className="rounded-full border border-white/10 px-3 py-2 text-sm md:hidden"
          >
            🛒
          </Link>
        </div>
      </header>


      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-white/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-5 py-24 text-center md:px-8 md:py-36">

          <div className="mx-auto mb-7 inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs uppercase tracking-[0.3em] text-gray-400">
            Welcome to ELVANTO
          </div>

          <h1 className="mx-auto max-w-5xl text-5xl font-black leading-[1.05] tracking-tight md:text-7xl lg:text-8xl">
            Discover.
            <br />
            <span className="text-gray-500">Choose. Enjoy.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-base leading-7 text-gray-400 md:text-lg">
            Discover smart, stylish and useful products selected for
            modern everyday life.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/products"
              className="rounded-xl bg-white px-8 py-4 font-bold text-black transition hover:scale-105 hover:bg-gray-200"
            >
              SHOP NOW →
            </Link>

            <Link
              href="/products"
              className="rounded-xl border border-white/20 px-8 py-4 font-semibold transition hover:bg-white/10"
            >
              EXPLORE COLLECTION
            </Link>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 border-y border-white/10 py-6">
            <div>
              <p className="text-2xl font-bold">5+</p>
              <p className="mt-1 text-xs text-gray-500">Categories</p>
            </div>

            <div className="border-x border-white/10">
              <p className="text-2xl font-bold">24/7</p>
              <p className="mt-1 text-xs text-gray-500">Shopping</p>
            </div>

            <div>
              <p className="text-2xl font-bold">100%</p>
              <p className="mt-1 text-xs text-gray-500">Simple</p>
            </div>
          </div>

        </div>
      </section>


      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8">

        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.35em] text-gray-500">
            EXPLORE
          </p>

          <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <h2 className="text-4xl font-bold md:text-5xl">
              Shop by category
            </h2>

            <Link
              href="/products"
              className="text-sm font-semibold text-gray-400 hover:text-white"
            >
              View all →
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/products?category=${encodeURIComponent(category.name)}`}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.07]"
            >
              <div className="text-3xl text-gray-300">
                {category.icon}
              </div>

              <h3 className="mt-8 font-semibold">
                {category.name}
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                {category.description}
              </p>

              <p className="mt-5 text-sm text-gray-400 transition group-hover:text-white">
                Explore →
              </p>
            </Link>
          ))}
        </div>
      </section>


      {/* FEATURED PRODUCTS */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8">

          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-gray-500">
                ELVANTO PICKS
              </p>

              <h2 className="mt-3 text-4xl font-bold md:text-5xl">
                Featured products
              </h2>
            </div>

            <Link
              href="/products"
              className="text-sm font-semibold text-gray-400 hover:text-white"
            >
              View all products →
            </Link>
          </div>


          {loading ? (
            <div className="py-20 text-center text-gray-500">
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-white/10 p-10 text-center text-gray-500">
              No products available yet.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {products.map((product) => (
                <div
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-black transition duration-300 hover:-translate-y-1 hover:border-white/25"
                >

                  <Link href={`/products/${product.id}`}>
                    <div className="overflow-hidden bg-white/5">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                  </Link>

                  <div className="p-6">

                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      {product.category}
                    </p>

                    <Link href={`/products/${product.id}`}>
                      <h3 className="mt-2 text-xl font-semibold transition hover:text-gray-400">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="mt-4 text-xl font-bold">
                      ${Number(product.price).toFixed(2)}
                    </p>

                    <Link
                      href={`/products/${product.id}`}
                      className="mt-5 block rounded-xl border border-white/15 px-5 py-3 text-center text-sm font-semibold transition hover:bg-white hover:text-black"
                    >
                      VIEW PRODUCT →
                    </Link>

                  </div>
                </div>
              ))}

            </div>
          )}

        </div>
      </section>


      {/* WHY ELVANTO */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8">

        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-gray-500">
            WHY ELVANTO
          </p>

          <h2 className="mt-3 text-4xl font-bold md:text-5xl">
            Shopping made simple.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-4">

          <div className="rounded-2xl border border-white/10 p-7">
            <div className="text-3xl">✦</div>
            <h3 className="mt-6 font-semibold">Curated Products</h3>
            <p className="mt-3 text-sm leading-6 text-gray-500">
              Useful products selected for modern everyday needs.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 p-7">
            <div className="text-3xl">◈</div>
            <h3 className="mt-6 font-semibold">Simple Shopping</h3>
            <p className="mt-3 text-sm leading-6 text-gray-500">
              Browse, choose and order without unnecessary complexity.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 p-7">
            <div className="text-3xl">✓</div>
            <h3 className="mt-6 font-semibold">Easy Ordering</h3>
            <p className="mt-3 text-sm leading-6 text-gray-500">
              A clean checkout experience designed for convenience.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 p-7">
            <div className="text-3xl">∞</div>
            <h3 className="mt-6 font-semibold">Always Exploring</h3>
            <p className="mt-3 text-sm leading-6 text-gray-500">
              New products and categories can be added anytime.
            </p>
          </div>

        </div>
      </section>


      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8">

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] px-6 py-16 text-center md:px-12">

          <p className="text-xs uppercase tracking-[0.35em] text-gray-500">
            START EXPLORING
          </p>

          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-bold md:text-6xl">
            Find something you'll love.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-gray-500">
            Explore the ELVANTO collection and discover products made
            for everyday life.
          </p>

          <Link
            href="/products"
            className="mt-8 inline-block rounded-xl bg-white px-9 py-4 font-bold text-black transition hover:scale-105 hover:bg-gray-200"
          >
            EXPLORE SHOP →
          </Link>

        </div>

      </section>


      {/* FOOTER */}
      <footer className="border-t border-white/10">

        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-3 md:px-8">

          <div>
            <h2 className="text-xl font-black tracking-[0.25em]">
              ELVANTO
            </h2>

            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-500">
              Smart. Stylish. Simple. Discover useful products for
              modern everyday life.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Shop</h3>

            <div className="mt-4 space-y-3 text-sm text-gray-500">
              <Link href="/products" className="block hover:text-white">
                All Products
              </Link>

              <Link href="/products" className="block hover:text-white">
                Categories
              </Link>

              <Link href="/cart" className="block hover:text-white">
                Cart
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">ELVANTO</h3>

            <div className="mt-4 space-y-3 text-sm text-gray-500">
              <Link href="/products" className="block hover:text-white">
                About
              </Link>

              <Link href="/products" className="block hover:text-white">
                Contact
              </Link>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 py-6 text-center">
          <p className="text-xs text-gray-600">
            © 2026 ELVANTO. All rights reserved.
          </p>
        </div>

      </footer>

    </main>
  );
}