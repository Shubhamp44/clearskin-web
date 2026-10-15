import React from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  ArrowLeft,
  LoaderCircle,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";

import useCart from "../hooks/useCart";
import ProductCard from "../components/ProductCard";

const Cart = () => {
  const {
    cartItems = [],
    loading,
    updatingId,
    error,
    message,
    updateQuantity,
    removeItem,
  } = useCart();

  const getProduct = (item) => {
    const product =
      item?.product ??
      item?.productId ??
      item?.item ??
      item;

    return product && typeof product === "object" ? product : {};
  };

  const getProductId = (item) => {
    const product = getProduct(item);

    return String(
      product?._id ??
      product?.id ??
      (typeof item?.productId === "string" ? item.productId : "") ??
      ""
    );
  };

  const getQuantity = (item) => {
    const quantity = Number(item?.quantity ?? 1);
    return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  };

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

  const subtotal = cartItems.reduce((total, item) => {
    const product = getProduct(item);
    const price = Number(product?.price || 0);
    return total + price * getQuantity(item);
  }, 0);

  const shipping = subtotal === 0 || subtotal >= 999 ? 0 : 50;
  const gst = subtotal * 0.18;
  const grandTotal = subtotal + shipping + gst;

  return (
    <div className="min-h-screen bg-[#faf9f5]">
      {/* Page Header */}
      <section className="bg-[#e5efdf] px-4 py-8 sm:py-14">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/products"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-green-800"
          >
            <ArrowLeft size={17} />
            Continue Shopping
          </Link>

          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white p-4 text-green-800 shadow-sm">
              <ShoppingCart size={32} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl">
                My Shopping Cart
              </h1>

              <p className="mt-2 text-gray-600">
                Your skincare essentials are waiting for you.
              </p>

              <p className="mt-1 text-sm font-medium text-green-900">
                {cartItems.length}{" "}
                {cartItems.length === 1 ? "item" : "items"} in your cart
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cart Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {message && (
          <div className="mb-5 rounded-xl bg-green-100 p-4 text-sm text-green-800">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3">
            <LoaderCircle
              className="animate-spin text-green-800"
              size={28}
            />
            <span className="text-gray-600">Loading your cart...</span>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#e5efdf]">
              <ShoppingBag size={42} className="text-green-800" />
            </div>

            <h2 className="text-2xl font-bold text-gray-800">
              Your cart is empty
            </h2>

            <p className="mt-3 text-gray-500">
              Discover skincare products made for your routine.
            </p>

            <Link
              to="/products"
              className="mt-7 inline-flex rounded-xl bg-green-800 px-6 py-3 font-semibold text-white transition hover:bg-green-900"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
            {/* Product Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-2">
              {cartItems.map((item, index) => {
                const product = getProduct(item);
                const productId = getProductId(item);
                const quantity = getQuantity(item);

                // Avoid rendering empty cards when the API
                // returns a product ID without populated product data.
                if (!product?._id && !product?.id && !product?.name) {
                  return (
                    <div
                      key={productId || index}
                      className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800"
                    >
                      Product details could not be loaded.
                      Please check the cart API response and make sure the
                      product reference is populated.
                    </div>
                  );
                }

                return (
                  <ProductCard
                    key={productId || index}
                    product={product}
                    variant="cart"
                    quantity={quantity}
                    updating={updatingId === productId}
                    onUpdateQuantity={(nextQuantity) =>
                      updateQuantity(item, nextQuantity)
                    }
                    onRemove={() => removeItem(productId)}
                  />
                );
              })}
            </div>

            {/* Order Summary */}
            <aside className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:sticky lg:top-6">
              <h2 className="text-xl font-bold text-gray-800">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between gap-4 text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between gap-4 text-gray-600">
                  <span>GST (18%)</span>
                  <span>₹{formatPrice(gst)}</span>
                </div>

                <div className="flex justify-between gap-4 text-gray-600">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? "FREE" : `₹${formatPrice(shipping)}`}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between gap-4 text-base font-bold text-gray-900">
                    <span>Grand Total</span>
                    <span>₹{formatPrice(grandTotal)}</span>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-gray-500">
                Free shipping on orders of ₹999 or more. Taxes are estimated.
              </p>

              <Link
                to="/checkout"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-green-800 px-5 py-3 font-semibold text-white transition hover:bg-green-900"
              >
                Proceed to Checkout
              </Link>

              <Link
                to="/products"
                className="mt-4 block text-center text-sm font-medium text-green-800 hover:underline"
              >
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;