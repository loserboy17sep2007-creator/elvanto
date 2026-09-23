"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../supabase";

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      setLoading(true);
      setMessage("");

      // Check login session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        setMessage("Please login as admin first.");
        setLoading(false);
        return;
      }

      // Check admin profile
      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error(
          "PROFILE ERROR:",
          profileError
        );

        setMessage(
          "Unable to verify admin account."
        );

        setLoading(false);
        return;
      }

      // IMPORTANT ADMIN CHECK
      if (profile?.role !== "admin") {
        setMessage(
          "Access denied. Admin account required."
        );

        setLoading(false);
        return;
      }

      // User is admin
      setAuthorized(true);

      await loadOrders();
    } catch (error) {
      console.error(
        "ADMIN CHECK ERROR:",
        error
      );

      setMessage(
        "Something went wrong."
      );

      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const {
        data,
        error,
      } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "ORDERS ERROR:",
          error
        );

        setMessage(error.message);
        return;
      }

      setOrders((data as Order[]) || []);
    } catch (error) {
      console.error(
        "LOAD ORDERS ERROR:",
        error
      );

      setMessage(
        "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (
    orderId: string,
    newStatus: string
  ) => {
    try {
      const {
        error,
      } = await supabase
        .from("orders")
        .update({
          status: newStatus,
        })
        .eq("id", orderId);

      if (error) {
        console.error(
          "STATUS UPDATE ERROR:",
          error
        );

        alert(
          "Status update failed: " +
            error.message
        );

        return;
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus,
              }
            : order
        )
      );

      alert(
        "Order status updated successfully."
      );
    } catch (error) {
      console.error(
        "UPDATE ERROR:",
        error
      );

      alert(
        "Something went wrong."
      );
    }
  };

  const getStatusStyle = (
    status: string
  ) => {
    switch (
      status.toLowerCase()
    ) {
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

  const formatDate = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleString(
      "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">

        <div className="text-center">

          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-gray-600">
            Checking admin access...
          </p>

        </div>

      </main>
    );
  }

  // =========================
  // ACCESS DENIED / ERROR
  // =========================

  if (!authorized) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

        <div className="bg-white rounded-3xl shadow-sm border p-8 text-center max-w-md w-full">

          <div className="text-6xl">
            🔒
          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            Access Denied
          </h1>

          <p className="mt-3 text-gray-500">
            {message ||
              "You do not have permission to access this page."}
          </p>

          <div className="mt-7 flex flex-col gap-3">

            <Link
              href="/"
              className="w-full bg-black text-white rounded-xl py-3 font-semibold"
            >
              Go Home
            </Link>

            <Link
              href="/orders"
              className="w-full border border-gray-300 rounded-xl py-3 font-semibold"
            >
              My Orders
            </Link>

          </div>

        </div>

      </main>
    );
  }

  // =========================
  // STATS
  // =========================

  const pendingOrders =
    orders.filter(
      (order) =>
        order.status.toLowerCase() ===
        "pending"
    ).length;

  const processingOrders =
    orders.filter(
      (order) =>
        order.status.toLowerCase() ===
        "processing"
    ).length;

  const shippedOrders =
    orders.filter(
      (order) =>
        order.status.toLowerCase() ===
        "shipped"
    ).length;

  const deliveredOrders =
    orders.filter(
      (order) =>
        order.status.toLowerCase() ===
        "delivered"
    ).length;

  // =========================
  // ADMIN DASHBOARD
  // =========================

  return (
    <main className="min-h-screen bg-gray-100">

      {/* NAVBAR */}

      <nav className="bg-black text-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="h-16 flex items-center justify-between">

            <Link
              href="/"
              className="text-2xl font-black tracking-wide"
            >
              ELVANTO
            </Link>

            <div className="flex items-center gap-5">

              <span className="hidden sm:block text-sm text-gray-300">
                ADMIN
              </span>

              <Link
                href="/orders"
                className="text-sm font-semibold hover:text-gray-300"
              >
                My Orders
              </Link>

            </div>

          </div>

        </div>

      </nav>

      {/* CONTENT */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

          <div>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-gray-500">
              Manage all ELVANTO customer orders.
            </p>

          </div>

          <button
            onClick={loadOrders}
            className="bg-black text-white px-5 py-3 rounded-xl font-semibold hover:bg-gray-800"
          >
            ↻ Refresh
          </button>

        </div>

        {/* STATS */}

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">

          <div className="bg-white rounded-2xl border p-5">

            <p className="text-sm text-gray-500">
              Total
            </p>

            <p className="mt-2 text-3xl font-black">
              {orders.length}
            </p>

          </div>

          <div className="bg-white rounded-2xl border p-5">

            <p className="text-sm text-gray-500">
              Pending
            </p>

            <p className="mt-2 text-3xl font-black text-orange-600">
              {pendingOrders}
            </p>

          </div>

          <div className="bg-white rounded-2xl border p-5">

            <p className="text-sm text-gray-500">
              Processing
            </p>

            <p className="mt-2 text-3xl font-black text-blue-600">
              {processingOrders}
            </p>

          </div>

          <div className="bg-white rounded-2xl border p-5">

            <p className="text-sm text-gray-500">
              Shipped
            </p>

            <p className="mt-2 text-3xl font-black text-purple-600">
              {shippedOrders}
            </p>

          </div>

          <div className="bg-white rounded-2xl border p-5">

            <p className="text-sm text-gray-500">
              Delivered
            </p>

            <p className="mt-2 text-3xl font-black text-green-600">
              {deliveredOrders}
            </p>

          </div>

        </div>

        {/* ORDERS */}

        {orders.length === 0 ? (

          <div className="bg-white rounded-3xl border p-12 text-center">

            <div className="text-6xl">
              📦
            </div>

            <h2 className="mt-5 text-2xl font-bold">
              No Orders Found
            </h2>

            <p className="mt-2 text-gray-500">
              Customer orders will appear here.
            </p>

          </div>

        ) : (

          <div className="space-y-5">

            {orders.map(
              (order) => (

                <div
                  key={order.id}
                  className="bg-white rounded-3xl border shadow-sm overflow-hidden"
                >

                  {/* ORDER HEADER */}

                  <div className="p-6 border-b">

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                      <div>

                        <p className="text-xs uppercase tracking-wider text-gray-500">
                          Order ID
                        </p>

                        <p className="mt-1 font-bold text-gray-900 break-all">
                          {order.id}
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                          {formatDate(
                            order.created_at
                          )}
                        </p>

                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                        <div>

                          <p className="text-sm text-gray-500">
                            Total
                          </p>

                          <p className="text-2xl font-black">
                            $
                            {Number(
                              order.total
                            ).toFixed(2)}
                          </p>

                        </div>

                        <select
                          value={
                            order.status
                          }
                          onChange={(
                            e
                          ) =>
                            updateStatus(
                              order.id,
                              e.target
                                .value
                            )
                          }
                          className={`px-4 py-3 rounded-xl font-semibold outline-none ${getStatusStyle(
                            order.status
                          )}`}
                        >

                          <option value="Pending">
                            Pending
                          </option>

                          <option value="Processing">
                            Processing
                          </option>

                          <option value="Shipped">
                            Shipped
                          </option>

                          <option value="Delivered">
                            Delivered
                          </option>

                          <option value="Cancelled">
                            Cancelled
                          </option>

                        </select>

                      </div>

                    </div>

                  </div>

                  {/* CUSTOMER + DELIVERY */}

                  <div className="p-6 grid md:grid-cols-2 gap-6">

                    <div className="rounded-2xl bg-gray-50 p-5">

                      <h2 className="font-bold text-gray-900">
                        Customer
                      </h2>

                      <div className="mt-3 space-y-1 text-sm text-gray-600">

                        <p>
                          <strong>
                            Name:
                          </strong>{" "}
                          {
                            order.customer_name
                          }
                        </p>

                        <p>
                          <strong>
                            Email:
                          </strong>{" "}
                          {order.email}
                        </p>

                        <p>
                          <strong>
                            Phone:
                          </strong>{" "}
                          {order.phone}
                        </p>

                      </div>

                    </div>

                    <div className="rounded-2xl bg-gray-50 p-5">

                      <h2 className="font-bold text-gray-900">
                        Delivery
                      </h2>

                      <div className="mt-3 text-sm text-gray-600">

                        <p>
                          {order.address}
                        </p>

                        <p>
                          {order.city},{" "}
                          {order.country}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* PRODUCTS */}

                  <div className="px-6 pb-6">

                    <h2 className="font-bold text-gray-900 mb-4">
                      Products
                    </h2>

                    <div className="space-y-3">

                      {Array.isArray(
                        order.products
                      ) &&
                        order.products.map(
                          (product) => (

                            <div
                              key={
                                product.id
                              }
                              className="flex items-center gap-4 border rounded-2xl p-4"
                            >

                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">

                                <img
                                  src={
                                    product.image
                                  }
                                  alt={
                                    product.name
                                  }
                                  className="w-full h-full object-cover"
                                />

                              </div>

                              <div className="flex-1">

                                <p className="font-semibold">
                                  {
                                    product.name
                                  }
                                </p>

                                <p className="text-sm text-gray-500">
                                  Qty:{" "}
                                  {
                                    product.quantity
                                  }
                                </p>

                              </div>

                              <p className="font-bold">

                                $
                                {(
                                  Number(
                                    product.price
                                  ) *
                                  Number(
                                    product.quantity
                                  )
                                ).toFixed(
                                  2
                                )}

                              </p>

                            </div>

                          )
                        )}

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </main>
  );
}