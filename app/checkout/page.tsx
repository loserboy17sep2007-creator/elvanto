"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../supabase";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
};

const SHIPPING_FEE = 4.99;

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    const loadCheckout = async () => {
      try {
        const savedCart =
          localStorage.getItem("elvanto-cart");

        if (!savedCart) {
          router.push("/cart");
          return;
        }

        const parsedCart = JSON.parse(savedCart);

        if (
          !Array.isArray(parsedCart) ||
          parsedCart.length === 0
        ) {
          router.push("/cart");
          return;
        }

        const fixedCart: CartItem[] =
          parsedCart.map((item: CartItem) => ({
            ...item,
            price: Number(item.price),
            quantity: Number(item.quantity),
            stock:
              typeof item.stock === "number"
                ? item.stock
                : 999999,
          }));

        setCart(fixedCart);

        // LOAD COUPON
        const savedCoupon =
          localStorage.getItem("elvanto-coupon");

        if (savedCoupon) {
          try {
            const couponData =
              JSON.parse(savedCoupon);

            if (
              couponData.code === "ELVANTO10" &&
              Number(couponData.discount) === 0.1
            ) {
              setCouponCode("ELVANTO10");
              setDiscount(0.1);
            } else {
              localStorage.removeItem(
                "elvanto-coupon"
              );
            }
          } catch {
            localStorage.removeItem(
              "elvanto-coupon"
            );
          }
        }

        // CHECK LOGIN
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error(
            "SESSION ERROR:",
            sessionError
          );

          alert(
            "Unable to verify your login session."
          );

          router.push("/login");
          return;
        }

        if (!session?.user) {
          alert(
            "Please login before checkout."
          );

          router.push("/login");
          return;
        }

        setEmail(session.user.email || "");

      } catch (error) {
        console.error(
          "CHECKOUT LOAD ERROR:",
          error
        );

        router.push("/cart");
        return;
      } finally {
        setPageLoading(false);
      }
    };

    loadCheckout();
  }, [router]);

  // TOTALS

  const subtotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price) *
        Number(item.quantity),
    0
  );

  const shipping =
    subtotal > 0 ? SHIPPING_FEE : 0;

  const discountAmount =
    subtotal * discount;

  const total =
    subtotal +
    shipping -
    discountAmount;

  // PLACE ORDER

  const placeOrder = async () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !country.trim() ||
      !city.trim() ||
      !address.trim()
    ) {
      alert(
        "Please fill all required fields."
      );
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      router.push("/cart");
      return;
    }

    setLoading(true);

    try {
      // GET SESSION

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error(
          "SESSION ERROR:",
          sessionError
        );

        alert(
          "Unable to verify your login session."
        );

        setLoading(false);
        return;
      }

      if (!session?.user) {
        alert(
          "Please login before placing your order."
        );

        setLoading(false);
        router.push("/login");
        return;
      }

      // VERIFY PRODUCTS

      const productIds = cart.map(
        (item) => item.id
      );

      const {
        data: latestProducts,
        error: productsError,
      } = await supabase
        .from("products")
        .select(
          "id, name, price, image, stock"
        )
        .in("id", productIds);

      if (productsError) {
        console.error(
          "PRODUCT CHECK ERROR:",
          productsError
        );

        alert(
          "Unable to verify products. Please try again."
        );

        setLoading(false);
        return;
      }

      if (
        !latestProducts ||
        latestProducts.length !== cart.length
      ) {
        alert(
          "One or more products are no longer available."
        );

        setLoading(false);
        return;
      }

      // CHECK STOCK + PRICE

      for (const cartItem of cart) {
        const latestProduct =
          latestProducts.find(
            (product) =>
              product.id === cartItem.id
          );

        if (!latestProduct) {
          alert(
            `${cartItem.name} is no longer available.`
          );

          setLoading(false);
          return;
        }

        if (
          Number(cartItem.quantity) >
          Number(latestProduct.stock)
        ) {
          alert(
            `Not enough stock for ${latestProduct.name}. Available stock: ${latestProduct.stock}`
          );

          setLoading(false);
          return;
        }

        if (
          Number(cartItem.price) !==
          Number(latestProduct.price)
        ) {
          alert(
            `The price of ${latestProduct.name} has changed. Please return to the products page and add it again.`
          );

          setLoading(false);
          return;
        }
      }

      // GENERATE ORDER ID

      const newOrderId =
        "ELV-" +
        Date.now().toString().slice(-8) +
        "-" +
        Math.floor(
          Math.random() * 1000
        );

      // ORDER DATA

      const orderData = {
        id: newOrderId,

        user_id: session.user.id,

        customer_name:
          name.trim(),

        email:
          email.trim(),

        phone:
          phone.trim(),

        country:
          country.trim(),

        city:
          city.trim(),

        address:
          address.trim(),

        total:
          Number(total.toFixed(2)),

        products:
          cart,

        status:
          "Pending",
      };

      console.log(
        "ORDER DATA:",
        orderData
      );

      // SAVE ORDER

      const {
        error: supabaseError,
      } = await supabase
        .from("orders")
        .insert([orderData]);

      if (supabaseError) {
        console.error(
          "ORDER ERROR:",
          supabaseError
        );

        alert(
          "Order failed: " +
            supabaseError.message
        );

        setLoading(false);
        return;
      }

      // --------------------------------
      // REDUCE STOCK
      // --------------------------------

      for (const cartItem of cart) {
        const {
          data: stockResult,
          error: stockError,
        } = await supabase.rpc(
          "reduce_product_stock",
          {
            p_product_id: cartItem.id,
            p_quantity: Number(
              cartItem.quantity
            ),
          }
        );

        if (stockError) {
          console.error(
            "STOCK UPDATE ERROR:",
            stockError
          );

          alert(
            `Order was created, but stock update failed for ${cartItem.name}. Please contact admin.`
          );

          setLoading(false);
          return;
        }

        if (stockResult !== true) {
          console.error(
            "STOCK REDUCTION FAILED:",
            cartItem.name
          );

          alert(
            `Order was created, but stock could not be reduced for ${cartItem.name}. Please contact admin.`
          );

          setLoading(false);
          return;
        }
      }

      // SAVE ORDER LOCALLY

      localStorage.setItem(
        "elvanto-order",
        JSON.stringify({
          id: newOrderId,
          coupon: couponCode,
          discount: discount,
          subtotal: Number(
            subtotal.toFixed(2)
          ),
          shipping: Number(
            shipping.toFixed(2)
          ),
          discountAmount: Number(
            discountAmount.toFixed(2)
          ),
          total: Number(
            total.toFixed(2)
          ),
        })
      );

      // CLEAR CART

      localStorage.removeItem(
        "elvanto-cart"
      );

      localStorage.removeItem(
        "elvanto-coupon"
      );

      // CONFIRM ORDER

      setOrderId(newOrderId);
      setOrderConfirmed(true);
      setCart([]);
      setDiscount(0);
      setCouponCode("");
      setLoading(false);

    } catch (error) {
      console.error(
        "CHECKOUT ERROR:",
        error
      );

      alert(
        "Something went wrong while placing your order."
      );

      setLoading(false);
    }
  };

  // PAGE LOADING

  if (pageLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            ELVANTO
          </div>

          <p className="mt-2 text-gray-500">
            Loading checkout...
          </p>
        </div>
      </main>
    );
  }

  // ORDER CONFIRMED

  if (orderConfirmed) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white max-w-lg w-full rounded-3xl shadow-xl p-8 text-center">

          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-4xl text-green-600">
              ✓
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Order Confirmed!
          </h1>

          <p className="mt-3 text-gray-600">
            Thank you for shopping with ELVANTO.
          </p>

          <div className="mt-6 bg-gray-100 rounded-2xl p-5">
            <p className="text-sm text-gray-500">
              Your Order ID
            </p>

            <p className="mt-2 text-xl font-bold text-gray-900 break-all">
              {orderId}
            </p>
          </div>

          <p className="mt-5 text-sm text-gray-500">
            Order Status:{" "}
            <span className="font-semibold text-orange-600">
              Pending
            </span>
          </p>

          <div className="mt-7 flex flex-col gap-3">

            <Link
              href="/orders"
              className="w-full rounded-xl bg-black text-white py-3 font-semibold hover:bg-gray-800 transition"
            >
              Track My Order
            </Link>

            <Link
              href="/products"
              className="w-full rounded-xl border border-gray-300 py-3 font-semibold text-gray-800 hover:bg-gray-50 transition"
            >
              Continue Shopping
            </Link>

          </div>

        </div>
      </main>
    );
  }

  // CHECKOUT PAGE

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
              href="/cart"
              className="text-sm font-semibold text-gray-700 hover:text-black"
            >
              ← Back to Cart
            </Link>

          </div>

        </div>
      </nav>

      {/* MAIN */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="mb-8">

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Checkout
          </h1>

          <p className="mt-2 text-gray-500">
            Complete your details to place your order.
          </p>

        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* DELIVERY */}

          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border p-6 sm:p-8">

            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Delivery Information
            </h2>

            <div className="grid sm:grid-cols-2 gap-5">

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  placeholder="+92 300 1234567"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Country
                </label>

                <input
                  type="text"
                  value={country}
                  onChange={(e) =>
                    setCountry(e.target.value)
                  }
                  placeholder="Pakistan"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City
                </label>

                <input
                  type="text"
                  value={city}
                  onChange={(e) =>
                    setCity(e.target.value)
                  }
                  placeholder="Bahawalpur"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Address
                </label>

                <textarea
                  value={address}
                  onChange={(e) =>
                    setAddress(e.target.value)
                  }
                  placeholder="Enter your complete delivery address"
                  rows={4}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-black resize-none"
                />
              </div>

            </div>

            {/* PAYMENT */}

            <div className="mt-8 pt-8 border-t">

              <h2 className="text-xl font-bold text-gray-900">
                Payment Method
              </h2>

              <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-5">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border">
                    💳
                  </div>

                  <div>

                    <p className="font-semibold text-gray-900">
                      Payment
                    </p>

                    <p className="text-sm text-gray-500">
                      Payment gateway will be connected later.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* ORDER SUMMARY */}

          <div className="bg-white rounded-3xl shadow-sm border p-6 h-fit lg:sticky lg:top-24">

            <h2 className="text-xl font-bold text-gray-900">
              Order Summary
            </h2>

            <div className="mt-6 space-y-4">

              {cart.map((item) => (

                <div
                  key={item.id}
                  className="flex gap-3"
                >

                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">

                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        No Image
                      </div>
                    )}

                  </div>

                  <div className="flex-1 min-w-0">

                    <p className="font-semibold text-sm text-gray-900 truncate">
                      {item.name}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Qty: {item.quantity}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      Rs.{" "}
                      {Number(item.price).toFixed(2)} each
                    </p>

                  </div>

                  <p className="font-semibold text-sm text-gray-900 whitespace-nowrap">
                    Rs.{" "}
                    {(
                      Number(item.price) *
                      Number(item.quantity)
                    ).toFixed(2)}
                  </p>

                </div>

              ))}

            </div>

            {/* TOTALS */}

            <div className="mt-6 pt-6 border-t space-y-3">

              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>

                <span>
                  Rs. {subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>

                <span>
                  Rs. {shipping.toFixed(2)}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>
                    Discount ({couponCode})
                  </span>

                  <span>
                    - Rs.{" "}
                    {discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t flex justify-between">

                <span className="text-lg font-bold text-gray-900">
                  Total
                </span>

                <span className="text-xl font-black text-gray-900">
                  Rs. {total.toFixed(2)}
                </span>

              </div>

            </div>

            {/* PLACE ORDER */}

            <button
              onClick={placeOrder}
              disabled={
                loading ||
                cart.length === 0
              }
              className="mt-7 w-full rounded-xl bg-black text-white py-4 font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading
                ? "PLACING ORDER..."
                : "PLACE ORDER"}
            </button>

            <div className="mt-5 text-center">

              <p className="text-xs text-gray-500">
                🔒 Your order information is securely submitted.
              </p>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}