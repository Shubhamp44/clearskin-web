
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  CreditCard,
  LoaderCircle,
  MapPin,
  PackageCheck,
  ShoppingBag,
  ShieldCheck,
  Tag,
  Truck,
  UserRound,
} from "lucide-react";

import api from "../services/api";
import useCart from "../hooks/useCart";

const Checkout = () => {
  const { cartItems = [], loading, error: cartError, fetchCart } = useCart();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [sameBillingAddress, setSameBillingAddress] = useState(true);

  const [billingAddress, setBillingAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponError, setCouponError] = useState("");

  const [placingOrder, setPlacingOrder] = useState(false);
  const [pageError, setPageError] = useState("");
  const [successOrder, setSuccessOrder] = useState(null);

  const getProduct = (item) => {
    const product = item?.product ?? item?.productId ?? item?.item ?? item;
    return product && typeof product === "object" ? product : {};
  };

  const getQuantity = (item) => {
    const quantity = Number(item?.quantity ?? 1);
    return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  };

  const formatPrice = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Calculate subtotal from cart items.
  const subtotal = useMemo(
    () =>
      cartItems.reduce((total, item) => {
        const product = getProduct(item);
        return total + Number(product?.price || 0) * getQuantity(item);
      }, 0),
    [cartItems]
  );

  // Preview coupon calculation.
  const discount =
    appliedCoupon === "SAVE10"
      ? Number((subtotal * 0.1).toFixed(2))
      : 0;

  const discountedSubtotal = Number((subtotal - discount).toFixed(2));

  const shippingCharge =
    discountedSubtotal === 0 || discountedSubtotal >= 999 ? 0 : 50;

  const gst = Number((discountedSubtotal * 0.18).toFixed(2));

  const totalAmount = Number(
    (discountedSubtotal + shippingCharge + gst).toFixed(2)
  );

  const updateAddress = (setter, field, value) => {
    setter((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const applyCoupon = () => {
    setCouponError("");
    setCouponMessage("");

    const code = couponInput.trim().toUpperCase();

    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    if (code !== "SAVE10") {
      setAppliedCoupon("");
      setCouponError("Invalid coupon code. Try SAVE10.");
      return;
    }

    if (subtotal <= 0) {
      setCouponError("Add products to your cart first.");
      return;
    }

    setAppliedCoupon("SAVE10");
    setCouponInput("SAVE10");
    setCouponMessage("Coupon SAVE10 applied successfully! You saved 10%.");
  };

  const removeCoupon = () => {
    setAppliedCoupon("");
    setCouponInput("");
    setCouponMessage("");
    setCouponError("");
  };

  const validateAddress = (address) => {
    const requiredFields = [
      "fullName",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
    ];

    for (const field of requiredFields) {
      if (!String(address[field] || "").trim()) {
        return "Please fill in all required address fields.";
      }
    }

    if (!/^[6-9]\d{9}$/.test(address.phone.trim())) {
      return "Please enter a valid 10-digit Indian mobile number.";
    }

    if (!/^\d{6}$/.test(address.pincode.trim())) {
      return "Please enter a valid 6-digit PIN code.";
    }

    return "";
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    setPageError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setPageError("Please login before placing your order.");
      return;
    }

    if (cartItems.length === 0) {
      setPageError("Your cart is empty. Please add products first.");
      return;
    }

    const shippingValidation = validateAddress(shippingAddress);

    if (shippingValidation) {
      setPageError(shippingValidation);
      return;
    }

    const finalBillingAddress = sameBillingAddress
      ? shippingAddress
      : billingAddress;

    if (!sameBillingAddress) {
      const billingValidation = validateAddress(billingAddress);

      if (billingValidation) {
        setPageError(`Billing address: ${billingValidation}`);
        return;
      }
    }

    setPlacingOrder(true);

    try {
      const response = await api.post(
        "/orders",
        {
          shippingAddress,
          billingAddress: finalBillingAddress,
          couponCode: appliedCoupon || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data?.success || !response.data?.order) {
        throw new Error(response.data?.message || "Unable to place order.");
      }

      setSuccessOrder(response.data.order);

      // Refresh cart after successful order.
      try {
        await fetchCart();
      } catch (refreshError) {
        console.error("Cart refresh error:", refreshError);
      }
    } catch (err) {
      console.error(
        "Place order error:",
        err.response?.data || err
      );

      if (err.response?.status === 401) {
        setPageError("Your session has expired. Please login again.");
      } else {
        setPageError(
          err.response?.data?.message ||
            err.message ||
            "Something went wrong while placing your order."
        );
      }
    } finally {
      setPlacingOrder(false);
    }
  };

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-green-700 focus:ring-2 focus:ring-green-100";

  const labelClass = "text-sm font-medium text-gray-700";

  const renderAddressFields = (address, setter, prefix) => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <label className={`${labelClass} sm:col-span-2`}>
        Full name *
        <input
          className={inputClass}
          name={`${prefix}-fullName`}
          autoComplete={prefix === "shipping" ? "name" : "off"}
          placeholder="Enter full name"
          value={address.fullName}
          onChange={(e) =>
            updateAddress(setter, "fullName", e.target.value)
          }
          maxLength={100}
          required
          disabled={placingOrder}
        />
      </label>

      <label className={labelClass}>
        Mobile number *
        <input
          className={inputClass}
          type="tel"
          inputMode="numeric"
          autoComplete={prefix === "shipping" ? "tel" : "off"}
          placeholder="10-digit mobile number"
          value={address.phone}
          onChange={(e) =>
            updateAddress(
              setter,
              "phone",
              e.target.value.replace(/\D/g, "").slice(0, 10)
            )
          }
          maxLength={10}
          required
          disabled={placingOrder}
        />
      </label>

      <label className={labelClass}>
        PIN code *
        <input
          className={inputClass}
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="6-digit PIN code"
          value={address.pincode}
          onChange={(e) =>
            updateAddress(
              setter,
              "pincode",
              e.target.value.replace(/\D/g, "").slice(0, 6)
            )
          }
          maxLength={6}
          required
          disabled={placingOrder}
        />
      </label>

      <label className={`${labelClass} sm:col-span-2`}>
        House no., street and area *
        <textarea
          className={inputClass}
          rows={3}
          autoComplete="street-address"
          placeholder="House number, street, locality"
          value={address.address}
          onChange={(e) =>
            updateAddress(setter, "address", e.target.value)
          }
          maxLength={500}
          required
          disabled={placingOrder}
        />
      </label>

      <label className={labelClass}>
        City *
        <input
          className={inputClass}
          autoComplete="address-level2"
          placeholder="Enter city"
          value={address.city}
          onChange={(e) =>
            updateAddress(setter, "city", e.target.value)
          }
          maxLength={100}
          required
          disabled={placingOrder}
        />
      </label>

      <label className={labelClass}>
        State *
        <input
          className={inputClass}
          autoComplete="address-level1"
          placeholder="Enter state"
          value={address.state}
          onChange={(e) =>
            updateAddress(setter, "state", e.target.value)
          }
          maxLength={100}
          required
          disabled={placingOrder}
        />
      </label>
    </div>
  );

  // Order confirmation screen.
  if (successOrder) {
    return (
      <div className="min-h-screen bg-[#faf9f5] px-4 py-12 sm:py-20">
        <div className="mx-auto max-w-xl rounded-3xl border border-green-100 bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-800">
            <CheckCircle2 size={44} />
          </div>

          <h1 className="mt-6 text-3xl font-bold text-gray-800">
            Order Placed Successfully!
          </h1>

          <p className="mt-3 leading-7 text-gray-600">
            Thank you for shopping with Clear Skin. Your order has been
            received and will be processed soon.
          </p>

          <div className="mt-7 rounded-2xl bg-[#f5f7f0] p-5 text-left">
            <div className="flex justify-between gap-3 py-2 text-sm">
              <span className="text-gray-500">Order ID</span>
              <span className="break-all text-right font-semibold text-gray-800">
                {successOrder._id}
              </span>
            </div>

            <div className="flex justify-between gap-3 border-t border-gray-200 py-3 text-sm">
              <span className="text-gray-500">Payment method</span>
              <span className="font-semibold text-gray-800">
                Cash on Delivery
              </span>
            </div>

            <div className="flex justify-between gap-3 border-t border-gray-200 py-3">
              <span className="text-gray-600">Total amount</span>
              <span className="text-lg font-bold text-green-800">
                ₹{formatPrice(successOrder.totalAmount)}
              </span>
            </div>

            <div className="flex justify-between gap-3 border-t border-gray-200 py-2 text-sm">
              <span className="text-gray-500">Order status</span>
              <span className="font-semibold text-amber-700">
                {successOrder.orderStatus || "Pending"}
              </span>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/products"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-800 px-5 py-3 font-semibold text-white transition hover:bg-green-900"
            >
              <ShoppingBag size={18} />
              Continue Shopping
            </Link>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <PackageCheck size={18} />
              Print Confirmation
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 bg-[#faf9f5] text-gray-600">
        <LoaderCircle className="animate-spin text-green-800" size={28} />
        Loading checkout...
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf9f5] px-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e5efdf] text-green-800">
          <ShoppingBag size={38} />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-gray-800">
          Your cart is empty
        </h1>

        <p className="mt-2 text-gray-500">
          Add your favourite skincare products before checkout.
        </p>

        <Link
          to="/products"
          className="mt-6 rounded-xl bg-green-800 px-6 py-3 font-semibold text-white hover:bg-green-900"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] pb-12">
      {/* Header */}
      <section className="bg-[#e5efdf] px-4 py-8 sm:py-10">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-green-800"
          >
            <ArrowLeft size={17} />
            Back to Cart
          </Link>

          <div className="mt-5 flex items-center gap-4">
            <div className="rounded-2xl bg-white p-3 text-green-800 shadow-sm">
              <ShoppingBag size={29} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl">
                Checkout
              </h1>
              <p className="mt-1 text-sm text-gray-600 sm:text-base">
                Just a few details before your skincare arrives.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {(pageError || cartError) && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
          >
            <CircleAlert size={20} className="mt-0.5 shrink-0" />
            <span>{pageError || cartError}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-3">
            {/* Address and Payment */}
            <div className="space-y-6 lg:col-span-2">
              {/* Shipping address */}
              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-xl bg-[#e5efdf] p-3 text-green-800">
                    <MapPin size={22} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Delivery Address
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Where should we deliver your order?
                    </p>
                  </div>
                </div>

                {renderAddressFields(
                  shippingAddress,
                  setShippingAddress,
                  "shipping"
                )}
              </section>

              {/* Billing address */}
              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl bg-[#e5efdf] p-3 text-green-800">
                    <UserRound size={22} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Billing Address
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Enter your billing details.
                    </p>
                  </div>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-green-100 bg-[#f5f8f1] p-4">
                  <input
                    type="checkbox"
                    checked={sameBillingAddress}
                    onChange={(e) =>
                      setSameBillingAddress(e.target.checked)
                    }
                    className="mt-1 h-4 w-4 accent-green-800"
                    disabled={placingOrder}
                  />

                  <span>
                    <span className="block text-sm font-semibold text-gray-800">
                      Billing address same as delivery address
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      Use the delivery address for billing.
                    </span>
                  </span>
                </label>

                {!sameBillingAddress && (
                  <div className="mt-6">
                    {renderAddressFields(
                      billingAddress,
                      setBillingAddress,
                      "billing"
                    )}
                  </div>
                )}
              </section>

              {/* Payment method */}
              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl bg-[#e5efdf] p-3 text-green-800">
                    <CreditCard size={22} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Payment Method
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Choose how you want to pay.
                    </p>
                  </div>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-green-700 bg-green-50 p-4">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked
                    readOnly
                    className="mt-1 accent-green-800"
                  />

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-gray-800">
                        Cash on Delivery
                      </span>
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                        Available
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      Pay when your order is delivered to your address.
                    </p>
                  </div>
                </label>

                <p className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                  <ShieldCheck size={16} className="text-green-800" />
                  Your order will be created securely using your account.
                </p>
              </section>
            </div>

            {/* Order Summary */}
            <aside className="space-y-5 lg:sticky lg:top-6">
              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">
                    Order Summary
                  </h2>
                  <span className="rounded-full bg-[#e5efdf] px-3 py-1 text-xs font-semibold text-green-900">
                    {cartItems.length}{" "}
                    {cartItems.length === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="mt-5 max-h-72 space-y-4 overflow-y-auto pr-1">
                  {cartItems.map((item, index) => {
                    const product = getProduct(item);
                    const quantity = getQuantity(item);
                    const productId =
                      product?._id ||
                      product?.id ||
                      item?.productId ||
                      index;

                    return (
                      <div
                        key={String(productId)}
                        className="flex items-start gap-3"
                      >
                        {product?.image ? (
                          <img
                            src={
                              product.image.startsWith("http")
                                ? product.image
                                : `${
                                    (import.meta.env.VITE_API_URL ||
                                      "http://localhost:8000/api").replace(
                                      /\/api\/?$/,
                                      ""
                                    )
                                  }${
                                    product.image.startsWith("/") ? "" : "/"
                                  }${product.image}`
                            }
                            alt={product.name || "Product"}
                            className="h-16 w-16 rounded-xl bg-[#f5f5f0] object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#f5f5f0] text-green-800">
                            <ShoppingBag size={24} />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-semibold text-gray-800">
                            {product?.name || "Skincare Product"}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Quantity: {quantity}
                          </p>

                          <p className="mt-1 text-sm font-semibold text-green-800">
                            ₹
                            {formatPrice(
                              Number(product?.price || 0) * quantity
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Coupon */}
                <div className="mt-6 border-t border-gray-100 pt-5">
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Tag size={17} className="text-green-800" />
                    Apply Coupon
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponError("");
                        setCouponMessage("");
                      }}
                      placeholder="Enter coupon code"
                      className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-3 text-sm uppercase outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
                      disabled={placingOrder || Boolean(appliedCoupon)}
                      maxLength={30}
                    />

                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={removeCoupon}
                        disabled={placingOrder}
                        className="rounded-xl border border-red-200 px-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={applyCoupon}
                        disabled={placingOrder}
                        className="rounded-xl bg-green-800 px-4 text-sm font-semibold text-white transition hover:bg-green-900 disabled:opacity-50"
                      >
                        Apply
                      </button>
                    )}
                  </div>

                  {couponMessage && (
                    <p className="mt-2 text-xs text-green-700">
                      {couponMessage}
                    </p>
                  )}

                  {couponError && (
                    <p className="mt-2 text-xs text-red-600">
                      {couponError}
                    </p>
                  )}

                  {!appliedCoupon && (
                    <p className="mt-2 text-xs text-gray-500">
                      Try SAVE10 for 10% off your order.
                    </p>
                  )}
                </div>

                {/* Price breakdown */}
                <div className="mt-6 space-y-3 border-t border-gray-100 pt-5 text-sm">
                  <div className="flex justify-between gap-3 text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{formatPrice(subtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between gap-3 text-green-700">
                      <span>Coupon discount (10%)</span>
                      <span>-₹{formatPrice(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between gap-3 text-gray-600">
                    <span>GST (18%)</span>
                    <span>₹{formatPrice(gst)}</span>
                  </div>

                  <div className="flex justify-between gap-3 text-gray-600">
                    <span>Shipping</span>
                    <span
                      className={
                        shippingCharge === 0
                          ? "font-semibold text-green-700"
                          : ""
                      }
                    >
                      {shippingCharge === 0
                        ? "FREE"
                        : `₹${formatPrice(shippingCharge)}`}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3 border-t border-gray-200 pt-4 text-base font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-green-800">
                      ₹{formatPrice(totalAmount)}
                    </span>
                  </div>

                  <p className="text-xs leading-5 text-gray-500">
                    {discountedSubtotal >= 999
                      ? "You qualify for free shipping!"
                      : `Add ₹${formatPrice(
                          Math.max(0, 999 - discountedSubtotal)
                        )} more to your discounted subtotal to qualify for free shipping.`}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={placingOrder || cartItems.length === 0}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-green-800 px-5 py-3.5 font-semibold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {placingOrder ? (
                    <>
                      <LoaderCircle size={19} className="animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <PackageCheck size={19} />
                      Place Order · ₹{formatPrice(totalAmount)}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-gray-500">
                  <Truck size={16} className="text-green-800" />
                  Free shipping on orders of ₹999 or more
                </p>
              </section>

              <div className="flex items-start gap-3 rounded-2xl bg-[#eaf1e5] p-4">
                <ShieldCheck
                  size={22}
                  className="mt-0.5 shrink-0 text-green-800"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Shop with confidence
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-600">
                    Review your address and order details before confirming
                    your purchase.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Checkout;
