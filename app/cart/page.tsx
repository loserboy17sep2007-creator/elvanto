"use client";

import { useEffect, useState } from "react";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
};

const SHIPPING_FEE = 4.99;

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");

  // Load cart and saved coupon
  useEffect(() => {
    const savedCart = localStorage.getItem("elvanto-cart");

    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);

        const fixedCart = parsedCart.map((item: CartItem) => ({
          ...item,
          price: Number(item.price),
          quantity: Number(item.quantity),
          stock:
            typeof item.stock === "number"
              ? item.stock
              : 999999,
        }));

        setCart(fixedCart);
      } catch {
        setCart([]);
      }
    }

    // Load saved coupon
    const savedCoupon = localStorage.getItem("elvanto-coupon");

    if (savedCoupon) {
      try {
        const couponData = JSON.parse(savedCoupon);

        if (couponData.code === "ELVANTO10") {
          setCoupon("ELVANTO10");
          setDiscount(0.1);
          setCouponMessage(
            "10% discount applied successfully!"
          );
        }
      } catch {
        localStorage.removeItem("elvanto-coupon");
      }
    }
  }, []);

  // Update cart
  const updateCart = (updatedCart: CartItem[]) => {
    setCart(updatedCart);

    localStorage.setItem(
      "elvanto-cart",
      JSON.stringify(updatedCart)
    );
  };

  // Increase quantity
  const increaseQuantity = (id: string) => {
    updateCart(
      cart.map((item) => {
        if (item.id !== id) {
          return item;
        }

        if (item.quantity >= item.stock) {
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      })
    );
  };

  // Decrease quantity
  const decreaseQuantity = (id: string) => {
    updateCart(
      cart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove item
  const removeItem = (id: string) => {
    updateCart(
      cart.filter((item) => item.id !== id)
    );
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);

    localStorage.removeItem("elvanto-cart");

    // Also remove coupon when cart is cleared
    setCoupon("");
    setDiscount(0);
    setCouponMessage("");

    localStorage.removeItem("elvanto-coupon");
  };

  // Subtotal
  const subtotal = cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * item.quantity,
    0
  );

  // Shipping
  const shipping =
    subtotal > 0 ? SHIPPING_FEE : 0;

  // Discount amount
  const discountAmount =
    subtotal * discount;

  // Final total
  const total =
    subtotal + shipping - discountAmount;

  // Total items
  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Apply coupon
  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();

    if (code === "ELVANTO10") {
      setCoupon("ELVANTO10");
      setDiscount(0.1);

      localStorage.setItem(
        "elvanto-coupon",
        JSON.stringify({
          code: "ELVANTO10",
          discount: 0.1,
        })
      );

      setCouponMessage(
        "10% discount applied successfully!"
      );
    } else {
      setDiscount(0);

      localStorage.removeItem("elvanto-coupon");

      setCouponMessage(
        "Invalid coupon code."
      );
    }
  };

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Shopping Cart
          </h1>

          <p className="mt-2 text-gray-400">
            {totalItems} item
            {totalItems !== 1 ? "s" : ""} in your cart
          </p>
        </div>

        {/* Empty Cart */}
        {cart.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-gray-950 p-10 text-center">
            <h2 className="text-2xl font-semibold">
              Your cart is empty
            </h2>

            <p className="mt-2 text-gray-400">
              Add some products to your cart first.
            </p>

            <a
              href="/products"
              className="mt-6 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200"
            >
              Browse Products
            </a>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">

            {/* Cart Items */}
            <div className="space-y-4 lg:col-span-2">

              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-5 rounded-2xl border border-gray-800 bg-gray-950 p-5 sm:flex-row sm:items-center"
                >

                  {/* Product Image */}
                  <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-900">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">
                      {item.name}
                    </h2>

                    <p className="mt-1 text-gray-400">
                      Rs. {Number(item.price).toFixed(2)}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Stock: {item.stock}
                    </p>

                    {/* Quantity */}
                    <div className="mt-4 flex items-center gap-3">

                      <button
                        onClick={() =>
                          decreaseQuantity(item.id)
                        }
                        className="h-9 w-9 rounded-lg border border-gray-700 bg-gray-900 text-lg hover:bg-gray-800"
                      >
                        −
                      </button>

                      <span className="min-w-8 text-center font-semibold">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          increaseQuantity(item.id)
                        }
                        disabled={
                          item.quantity >= item.stock
                        }
                        className="h-9 w-9 rounded-lg border border-gray-700 bg-gray-900 text-lg hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        +
                      </button>

                    </div>
                  </div>

                  {/* Price + Remove */}
                  <div className="text-left sm:text-right">

                    <p className="text-xl font-bold">
                      Rs.{" "}
                      {(
                        Number(item.price) *
                        item.quantity
                      ).toFixed(2)}
                    </p>

                    <button
                      onClick={() =>
                        removeItem(item.id)
                      }
                      className="mt-3 text-sm text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>

                  </div>

                </div>
              ))}

              {/* Clear Cart */}
              <button
                onClick={clearCart}
                className="rounded-lg border border-red-900 px-5 py-2 text-sm text-red-400 hover:bg-red-950"
              >
                Clear Cart
              </button>

            </div>

            {/* Order Summary */}
            <div className="h-fit rounded-2xl border border-gray-800 bg-gray-950 p-6">

              <h2 className="text-2xl font-bold">
                Order Summary
              </h2>

              {/* Coupon */}
              <div className="mt-6">

                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Coupon Code
                </label>

                <div className="flex gap-2">

                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) =>
                      setCoupon(e.target.value)
                    }
                    placeholder="Enter coupon"
                    className="min-w-0 flex-1 rounded-lg border border-gray-700 bg-black px-3 py-3 text-white outline-none placeholder:text-gray-600 focus:border-white"
                  />

                  <button
                    onClick={applyCoupon}
                    className="rounded-lg bg-white px-4 py-3 font-semibold text-black hover:bg-gray-200"
                  >
                    Apply
                  </button>

                </div>

                {couponMessage && (
                  <p
                    className={`mt-2 text-sm ${
                      discount > 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {couponMessage}
                  </p>
                )}

                <p className="mt-2 text-xs text-gray-500">
                  Try: ELVANTO10
                </p>

              </div>

              {/* Summary */}
              <div className="mt-6 space-y-4 border-t border-gray-800 pt-5">

                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>
                    Rs. {subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span>
                    Rs. {shipping.toFixed(2)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>
                      Discount (10%)
                    </span>
                    <span>
                      - Rs.{" "}
                      {discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between border-t border-gray-800 pt-4 text-xl font-bold">
                  <span>Total</span>
                  <span>
                    Rs. {total.toFixed(2)}
                  </span>
                </div>

              </div>

              {/* Checkout */}
              <a
                href="/checkout"
                className="mt-6 block rounded-xl bg-white px-5 py-4 text-center font-bold text-black transition hover:bg-gray-200"
              >
                Proceed to Checkout
              </a>

              {/* Continue Shopping */}
              <a
                href="/products"
                className="mt-3 block text-center text-sm text-gray-400 hover:text-white"
              >
                Continue Shopping
              </a>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}