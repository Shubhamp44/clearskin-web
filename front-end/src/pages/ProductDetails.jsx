



import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useWishlist from "../hooks/useWishlist";
import useCart from "../hooks/useCart";
import useProduct from "../hooks/useProducts";
import getImageUrl from "../utils/imageUtils";

import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Star,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  Leaf,
  Package,
} from "lucide-react";


export default function ProductDetails() {
  const { id } = useParams();

  // Custom product hook
  const {
    product,
    loading,
    error: productError,
    refetchProduct,
  } = useProduct(id);

  const [quantity, setQuantity] = useState(1);

  // Wishlist hook
  const {
    addToWishlist,
    isInWishlist,
    wishlistLoadingIds,
    wishlistError,
    wishlistMessage,
  } = useWishlist();

  // Cart hook
  const {
    addToCart,
    addingId,
    error: cartError,
    message: cartMessage,
  } = useCart();

  // =====================================================
  // RESET QUANTITY WHEN PRODUCT CHANGES
  // =====================================================
  useEffect(() => {
    setQuantity(1);
  }, [id]);

  // =====================================================
  // PRODUCT DATA
  // =====================================================
  const imageUrl = getImageUrl(product?.image);
  const stock = Math.max(0, Number(product?.stock) || 0);

  const productId = String(product?._id || "");
  const isAdding = addingId === productId;

  const wishlistIsLoading = wishlistLoadingIds.some(
    (itemId) => String(itemId) === productId
  );

  // =====================================================
  // ADD TO CART
  // =====================================================
  const handleAddToCart = async () => {
    if (!product?._id || stock <= 0 || isAdding) return;

    if (quantity < 1 || quantity > stock) {
      return;
    }

    await addToCart(product, quantity);
  };

  // =====================================================
  // ADD TO WISHLIST
  // =====================================================
  const handleAddToWishlist = async () => {
    if (!product?._id || wishlistIsLoading) return;

    await addToWishlist(product);
  };

  // =====================================================
  // LOADING SKELETON
  // =====================================================
  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf9f5] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="mb-8 h-5 w-36 rounded bg-stone-200" />

          <div className="grid gap-8 md:grid-cols-2">
            <div className="h-80 rounded-3xl bg-stone-200 sm:h-[450px] lg:h-[540px]" />

            <div className="space-y-5 py-3">
              <div className="h-4 w-32 rounded bg-stone-200" />
              <div className="h-10 w-4/5 rounded bg-stone-200" />
              <div className="h-7 w-28 rounded bg-stone-200" />
              <div className="h-24 rounded bg-stone-200" />
              <div className="h-12 rounded bg-stone-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR / PRODUCT NOT FOUND
  // =====================================================
  if (productError || !product) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center bg-[#faf9f5] px-5 text-center">
        <Package size={44} className="text-emerald-700" />

        <h2 className="mt-4 text-2xl font-bold text-stone-800">
          Product Not Found
        </h2>

        <p className="mt-2 max-w-md text-sm leading-6 text-stone-500">
          {productError || "This product is not available."}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={refetchProduct}
            className="rounded-full bg-emerald-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900"
          >
            Try Again
          </button>

          <Link
            to="/products"
            className="rounded-full border border-emerald-800 px-6 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
          >
            Back to Products
          </Link>
        </div>
      </main>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#faf9f5] text-stone-800">
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">

        {/* BACK LINK */}
        <Link
          to="/products"
          className="mb-6 inline-flex items-center gap-2 rounded-full text-sm font-semibold text-emerald-800 transition hover:text-emerald-950 sm:mb-8"
        >
          <ArrowLeft size={18} />
          Back to Products
        </Link>

        {/* PRODUCT DETAILS CARD */}
        <div className="grid min-w-0 gap-6 rounded-2xl border border-stone-100 bg-white p-3 shadow-sm sm:gap-8 sm:rounded-3xl sm:p-5 md:grid-cols-2 md:p-6 lg:gap-12 lg:p-10">

          {/* PRODUCT IMAGE */}
          <div className="min-w-0">
            <div className="relative overflow-hidden rounded-2xl bg-stone-100">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.name || "Skincare product"}
                  className="h-[300px] w-full object-cover sm:h-[420px] md:h-[440px] lg:h-[540px]"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src =
                      "https://placehold.co/700x800?text=Clear+Skin";
                  }}
                />
              ) : (
                <div className="flex h-[300px] items-center justify-center text-sm text-stone-400 sm:h-[420px] md:h-[440px] lg:h-[540px]">
                  No Image Available
                </div>
              )}

              {/* STOCK BADGE */}
              {stock <= 0 && (
                <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white">
                  Out of Stock
                </span>
              )}
            </div>

            {/* TRUST CARDS */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-[#edf5ec] p-3 sm:gap-3">
                <Leaf
                  className="shrink-0 text-emerald-800"
                  size={22}
                />
                <span className="text-xs font-medium text-stone-700 sm:text-sm">
                  Everyday Skincare
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-[#edf5ec] p-3 sm:gap-3">
                <ShieldCheck
                  className="shrink-0 text-emerald-800"
                  size={22}
                />
                <span className="text-xs font-medium text-stone-700 sm:text-sm">
                  Quality Focused
                </span>
              </div>
            </div>

            {/* PRODUCT BENEFITS */}
            {Array.isArray(product.benefits) &&
              product.benefits.length > 0 && (
                <div className="mt-6 border-t border-stone-100 pt-5">
                  <h2 className="text-base font-bold text-stone-900 sm:text-lg">
                    Product Benefits
                  </h2>

                  <ul className="mt-3 space-y-3">
                    {product.benefits.map((benefit, index) => (
                      <li
                        key={`${benefit}-${index}`}
                        className="flex items-start gap-2 text-sm leading-6 text-stone-600"
                      >
                        <Leaf
                          size={17}
                          className="mt-1 shrink-0 text-emerald-700"
                        />
                        <span className="break-words">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>

          {/* PRODUCT INFORMATION */}
          <div className="flex min-w-0 flex-col py-2 sm:py-3 md:py-1">

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700 sm:text-xs">
              Your Daily Skincare Routine
            </p>

            {/* NAME */}
            <h1 className="mt-3 break-words text-2xl font-bold leading-tight text-stone-900 sm:text-3xl lg:text-4xl xl:text-5xl">
              {product.name}
            </h1>

            {/* RATING */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1.5">
                <Star
                  size={15}
                  fill="currentColor"
                  className="text-yellow-500"
                />

                <span className="text-sm font-semibold text-stone-700">
                  {product.rating ?? 0}
                </span>
              </div>

              <span className="text-xs text-stone-500 sm:text-sm">
                Customer product rating
              </span>
            </div>

            {/* PRICE */}
            <div className="mt-5 flex flex-wrap items-baseline gap-2 sm:mt-6">
              <span className="text-3xl font-bold text-emerald-800 sm:text-4xl">
                ₹{product.price ?? 0}
              </span>

              <span className="text-xs text-stone-500 sm:text-sm">
                Inclusive of applicable taxes
              </span>
            </div>

            {/* DESCRIPTION */}
            <div className="mt-6 border-t border-stone-100 pt-5 sm:mt-7">
              <h2 className="text-base font-bold text-stone-900 sm:text-lg">
                Product Description
              </h2>

              <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-stone-600 sm:leading-7">
                {product.description || "No description available."}
              </p>
            </div>

            {/* STOCK STATUS */}
            <div className="mt-5">
              {stock > 0 ? (
                <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 sm:text-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  In Stock — {stock} available
                </p>
              ) : (
                <p className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 sm:text-sm">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Currently Out of Stock
                </p>
              )}
            </div>

            {/* QUANTITY SELECTOR */}
            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-stone-800">
                Quantity
              </label>

              <div className="flex w-fit items-center overflow-hidden rounded-full border border-stone-200 bg-white">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                  onClick={() =>
                    setQuantity((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                  className="p-3 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40 sm:p-3.5"
                >
                  <Minus size={16} />
                </button>

                <span className="min-w-12 text-center text-sm font-semibold sm:min-w-14 sm:text-base">
                  {quantity}
                </span>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={quantity >= stock}
                  onClick={() =>
                    setQuantity((current) =>
                      Math.min(stock, current + 1)
                    )
                  }
                  className="p-3 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40 sm:p-3.5"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* ADD TO CART */}
            <button
              type="button"
              disabled={stock <= 0 || isAdding}
              onClick={handleAddToCart}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-800 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-stone-400 sm:py-4 sm:text-base"
            >
              <ShoppingCart size={19} />

              {stock <= 0
                ? "Out of Stock"
                : isAdding
                  ? "Adding..."
                  : "Add to Cart"}
            </button>

            {/* CART MESSAGES */}
            {cartMessage && (
              <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
                {cartMessage}
              </p>
            )}

            {cartError && (
              <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {cartError}
              </p>
            )}

            {/* ADD TO WISHLIST */}
            <button
              type="button"
              onClick={handleAddToWishlist}
              disabled={wishlistIsLoading}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-emerald-800 px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Heart
                size={19}
                className={
                  isInWishlist(product._id)
                    ? "fill-red-500 text-red-500"
                    : ""
                }
              />

              {wishlistIsLoading
                ? "Please wait..."
                : isInWishlist(product._id)
                  ? "Add to Wishlist Again"
                  : "Add to Wishlist"}
            </button>

            {/* WISHLIST MESSAGES */}
            {wishlistError && (
              <p className="mt-2 text-sm text-red-600">
                {wishlistError}
              </p>
            )}

            {wishlistMessage && (
              <p className="mt-2 text-sm text-emerald-700">
                {wishlistMessage}
              </p>
            )}

            {/* DELIVERY INFORMATION */}
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-stone-100 bg-[#faf9f5] p-4">
              <Truck
                className="mt-0.5 shrink-0 text-emerald-800"
                size={22}
              />

              <div>
                <h3 className="text-sm font-semibold text-stone-800">
                  Delivery Information
                </h3>

                <p className="mt-1 text-xs leading-5 text-stone-500 sm:text-sm">
                  Free shipping on orders above ₹999.
                </p>
              </div>
            </div>

            {/* INGREDIENTS */}
            {Array.isArray(product.ingredients) &&
              product.ingredients.length > 0 && (
                <div className="mt-7 border-t border-stone-100 pt-5">
                  <h2 className="text-base font-bold text-stone-900 sm:text-lg">
                    Key Ingredients
                  </h2>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.ingredients.map((ingredient, index) => (
                      <span
                        key={`${ingredient}-${index}`}
                        className="max-w-full break-words rounded-full bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 sm:text-sm"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </section>
    </main>
  );
}
