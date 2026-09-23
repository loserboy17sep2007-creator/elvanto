"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CartItem = {
  quantity?: number;
};

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = () => {
    try {
      const savedCart = localStorage.getItem("elvanto-cart");

      if (!savedCart) {
        setCartCount(0);
        return;
      }

      const cart: CartItem[] = JSON.parse(savedCart);

      const count = cart.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
      );

      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    updateCartCount();

    const handleCartUpdate = () => {
      updateCartCount();
    };

    window.addEventListener(
      "elvanto-cart-updated",
      handleCartUpdate
    );

    window.addEventListener("storage", handleCartUpdate);

    return () => {
      window.removeEventListener(
        "elvanto-cart-updated",
        handleCartUpdate
      );

      window.removeEventListener("storage", handleCartUpdate);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-black tracking-[0.2em] text-black"
        >
          ELVANTO
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-7 md:flex">

          <Link
            href="/"
            className="text-sm font-semibold text-gray-700 transition hover:text-black"
          >
            Home
          </Link>

          <Link
            href="/products"
            className="text-sm font-semibold text-gray-700 transition hover:text-black"
          >
            Shop
          </Link>

          <Link
            href="/orders"
            className="text-sm font-semibold text-gray-700 transition hover:text-black"
          >
            Orders
          </Link>

          <Link
            href="/cart"
            className="relative text-sm font-semibold text-gray-700 transition hover:text-black"
          >
            🛒 Cart

            {cartCount > 0 && (
              <span className="absolute -right-5 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[11px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

        </nav>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-4 md:hidden">

          <Link
            href="/products"
            className="text-sm font-semibold text-gray-700"
          >
            Shop
          </Link>

          <Link
            href="/cart"
            className="relative text-sm font-semibold text-gray-700"
          >
            🛒

            {cartCount > 0 && (
              <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

        </div>
      </div>
    </header>
  );
}