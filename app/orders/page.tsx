"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../supabase";

type Order = {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  total: number;
  products: {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
  }[];
  status: string;
  created_at: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      // Check logged-in user
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("SESSION ERROR:", sessionError);
        setErrorMessage("Unable to check your login session.");
        setLoading(false);
        return;
      }

      if (!session?.user) {
        setErrorMessage(
          "Please login to view your orders."
        );
        setLoading(false);
        return;
      }

      console.log("LOGGED IN USER:", session.user.id);

      // Get only this user's orders
      const {
        data,
        error: ordersError,
      } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", {
          ascending: false,
        });

      if (ordersError) {
        console.error(
          "ORDERS ERROR:",
          ordersError
        );

        setErrorMessage(
          ordersError.message
        );

        setLoading(false);
        return;
      }

      console.log("MY ORDERS:", data);

      setOrders((data as Order[]) || []);

      setLoading(false);
    } catch (error) {
      console.error(
        "LOAD ORDERS ERROR:",
        error
      );

      setErrorMessage(
        "Something went wrong while loading your orders."
      );

      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-orange-100 text-orange-700";

      case "processing":
        return "bg-blue-100 text-blue-700";

      case "shipped":
        return "bg-purple-100 text-purple-700";

      case "delivered":
        return "bg-green-100 text-green-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">

        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-16 flex items-center justify-between">

              <Link
                href="/"
                className="text-2xl font-black tracking-wide text-gray-900"
              >
                ELVANTO
              </Link>

              <Link
                href="/products"
                className="text-sm font-semibold text-gray-700"
              >
                Continue Shopping
              </Link>

            </div>
          </div>
        </nav>

        <div className="flex items-center justify-center min-h-[70vh]">

          <div className="text-center">

            <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto" />

            <p className="mt-4 text-gray-500">
              Loading your orders...
            </p>

          </div>

        </div>

      </main>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (errorMessage) {
    return (
      <main className="min-h-screen bg-gray-50">

        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="h-16 flex items-center justify-between">

              <Link
                href="/"
                className="text-2xl font-black tracking-wide text-gray-900"
              >
                ELVANTO
              </Link>

              <Link
                href="/products"
                className="text-sm font-semibold text-gray-700"
              >
                Continue Shopping
              </Link>

            </div>

          </div>
        </nav>

        <div className="max-w-xl mx-auto px-4 py-20 text-center">

          <div className="bg-white rounded-3xl shadow-sm border p-8">

            <div className="text-5xl">
              ⚠️
            </div>

            <h1 className="mt-5 text-2xl font-bold text-gray-900">
              Unable to Load Orders
            </h1>

            <p className="mt-3 text-gray-500">
              {errorMessage}
            </p>

            <div className="mt-7 flex flex-col gap-3">

              <button
                onClick={loadOrders}
                className="w-full bg-black text-white rounded-xl py-3 font-semibold hover:bg-gray-800"
              >
                Try Again
              </button>

              <Link
                href="/products"
                className="w-full border border-gray-300 rounded-xl py-3 font-semibold text-gray-800 hover:bg-gray-50"
              >
                Continue Shopping
              </Link>

            </div>

          </div>

        </div>

      </main>
    );
  }

  // =========================
  // NO ORDERS
  // =========================

  if (orders.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">

        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="h-16 flex items-center justify-between">

              <Link
                href="/"
                className="text-2xl font-black tracking-wide text-gray-900"
              >
                ELVANTO
              </Link>

              <Link
                href="/products"
                className="text-sm font-semibold text-gray-700"
              >
                Continue Shopping
              </Link>

            </div>

          </div>
        </nav>

        <div className="max-w-xl mx-auto px-4 py-20 text-center">

          <div className="bg-white rounded-3xl shadow-sm border p-10">

            <div className="text-6xl">
              📦
            </div>

            <h1 className="mt-5 text-3xl font-bold text-gray-900">
              No Orders Yet
            </h1>

            <p className="mt-3 text-gray-500">
              You haven't placed any orders yet.
            </p>

            <Link
              href="/products"
              className="inline-block mt-7 bg-black text-white rounded-xl px-7 py-3 font-semibold hover:bg-gray-800"
            >
              Start Shopping
            </Link>

          </div>

        </div>

      </main>
    );
  }

  // =========================
  // ORDERS
  // =========================

  return (
    <main className="min-h-screen bg-gray-50">

      {/* NAVBAR */}

      <nav className="bg-white border-b sticky top-0 z-50">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="h-16 flex items-center justify-between">

            <Link
              href="/"
              className="text-2xl font-black tracking-wide text-gray-900"
            >
              ELVANTO
            </Link>

            <Link
              href="/products"
              className="text-sm font-semibold text-gray-700 hover:text-black"
            >
              Continue Shopping
            </Link>

          </div>

        </div>

      </nav>

      {/* PAGE */}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="mb-8">

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            My Orders
          </h1>

          <p className="mt-2 text-gray-500">
            Track and manage your ELVANTO orders.
          </p>

        </div>

        <div className="space-y-6">

          {orders.map((order) => (

            <div
              key={order.id}
              className="bg-white rounded-3xl border shadow-sm overflow-hidden"
            >

              {/* ORDER HEADER */}

              <div className="p-6 border-b">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                  <div>

                    <p className="text-sm text-gray-500">
                      Order ID
                    </p>

                    <p className="mt-1 font-bold text-gray-900 break-all">
                      {order.id}
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </p>

                  </div>

                  <div className="sm:text-right">

                    <span
                      className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${getStatusStyle(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>

                    <p className="mt-3 text-xl font-black text-gray-900">
                      ${Number(order.total).toFixed(2)}
                    </p>

                  </div>

                </div>

              </div>

              {/* PRODUCTS */}

              <div className="p-6">

                <h2 className="font-bold text-gray-900 mb-4">
                  Products
                </h2>

                <div className="space-y-4">

                  {Array.isArray(order.products) &&
                    order.products.map((product) => (

                      <div
                        key={product.id}
                        className="flex items-center gap-4"
                      >

                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">

                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />

                        </div>

                        <div className="flex-1">

                          <p className="font-semibold text-gray-900">
                            {product.name}
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            Quantity:{" "}
                            {product.quantity}
                          </p>

                        </div>

                        <p className="font-semibold text-gray-900">
                          $
                          {(
                            Number(product.price) *
                            Number(product.quantity)
                          ).toFixed(2)}
                        </p>

                      </div>

                    ))}

                </div>

              </div>

              {/* DELIVERY */}

              <div className="px-6 pb-6">

                <div className="rounded-2xl bg-gray-50 p-5">

                  <h2 className="font-bold text-gray-900">
                    Delivery Information
                  </h2>

                  <p className="mt-3 text-sm text-gray-600">
                    {order.customer_name}
                  </p>

                  <p className="text-sm text-gray-600">
                    {order.phone}
                  </p>

                  <p className="text-sm text-gray-600">
                    {order.address}
                  </p>

                  <p className="text-sm text-gray-600">
                    {order.city}, {order.country}
                  </p>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </main>
  );
}