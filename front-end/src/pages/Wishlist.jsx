
import React from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  LoaderCircle,
} from "lucide-react";

import useWishlist from "../hooks/useWishlist";
import useCart from "../hooks/useCart";
import getImageUrl from "../utils/imageUtils";

const Wishlist = () => {
  const {
    products = [],
    loading,
    error,
    message,
    removeWishlistProduct,
  } = useWishlist();

  const {
    addToCart,
    addingId,
    error: cartError,
    message: cartMessage,
  } = useCart();

  const getProduct = (item) => item?.product || item || {};

  const getProductId = (item) => {
    const product = getProduct(item);
    return String(product?._id || product?.id || "");
  };

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-IN");

  const handleRemove = async (productId) => {
    if (!productId || !removeWishlistProduct) return;

    await removeWishlistProduct(productId);
  };

  const handleAddToCart = async (product) => {
    const productId = getProductId(product);

    if (!productId) {
      console.error("Wishlist product ID is missing.");
      return;
    }

    await addToCart(product, 1);
  };

  const displayError = error || cartError;
  const displayMessage = message || cartMessage;

  return (
    <div className="min-h-screen bg-[#faf9f5]">
      {/* Page Header */}
      <section className="bg-[#e5efdf] px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-800"
          >
            <ArrowLeft size={17} />
            Continue Shopping
          </Link>

          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white p-4 text-green-700 shadow-sm">
              <Heart size={32} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl">
                My Wishlist
              </h1>

              <p className="mt-2 text-sm text-gray-600 sm:text-base">
                Your favourite skincare products, all in one place.
              </p>
            </div>
          </div>

          <p className="mt-2 text-sm font-medium text-green-900">
            {products.length}{" "}
            {products.length === 1 ? "product" : "products"} saved
          </p>
        </div>
      </section>

      {/* Wishlist Content */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {displayMessage && (
          <div className="mb-6 rounded-xl bg-green-100 p-4 text-sm text-green-800">
            {displayMessage}
          </div>
        )}

        {displayError && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {displayError}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3">
            <LoaderCircle
              size={28}
              className="animate-spin text-green-700"
            />
            <p className="text-gray-600">
              Loading your wishlist...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="mx-auto max-w-lg py-16 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#e5efdf]">
              <Heart size={42} className="text-green-700" />
            </div>

            <h2 className="text-2xl font-bold text-gray-800">
              Your wishlist is empty
            </h2>

            <p className="mt-3 leading-7 text-gray-500">
              You haven't saved any skincare products yet.
              Explore our collection and find something you love!
            </p>

            <Link
              to="/products"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-green-800 px-6 py-3 font-semibold text-white transition hover:bg-green-900"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((item, index) => {
              const product = getProduct(item);
              const productId = getProductId(item);
              const imageUrl = getImageUrl(
                product.image || product.img
              );

              const isOutOfStock =
                product.stock != null &&
                Number(product.stock) <= 0;

              return (
                <article
                  key={productId || index}
                  className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Product Image */}
                  <div className="relative flex h-64 items-center justify-center overflow-hidden bg-[#f1f3eb]">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name || "Skincare product"}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <Heart
                        size={54}
                        className="text-green-300"
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemove(productId)}
                      disabled={!productId}
                      aria-label="Remove from wishlist"
                      className="absolute right-3 top-3 rounded-full bg-white p-3 text-red-500 shadow-md transition hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 size={19} />
                    </button>

                    {isOutOfStock && (
                      <span className="absolute bottom-3 left-3 rounded-lg bg-gray-800 px-3 py-1 text-xs font-semibold text-white">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-green-700">
                      {product.category?.name || "Skincare"}
                    </p>

                    <Link to={`/products/${productId}`}>
                      <h3 className="mt-2 line-clamp-2 min-h-12 text-lg font-semibold text-gray-800 hover:text-green-800">
                        {product.name || "Skincare Product"}
                      </h3>
                    </Link>

                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xl font-bold text-gray-900">
                        ₹{formatPrice(product.price)}
                      </p>

                      <span className="rounded-lg bg-[#f3f5ed] px-2 py-1 text-sm text-gray-700">
                        ★ {Number(product.rating || 0).toFixed(1)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      disabled={
                        !productId ||
                        addingId === productId ||
                        isOutOfStock
                      }
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-green-800 px-4 py-3 font-semibold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      {addingId === productId ? (
                        <LoaderCircle
                          size={19}
                          className="animate-spin"
                        />
                      ) : (
                        <ShoppingCart size={19} />
                      )}

                      {isOutOfStock
                        ? "Out of Stock"
                        : addingId === productId
                          ? "Adding..."
                          : "Add to Cart"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlist;
