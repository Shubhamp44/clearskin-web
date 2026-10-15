
import { Link } from "react-router-dom";

import useWishlist from "../hooks/useWishlist";
import useCart from "../hooks/useCart";
import useCategories from "../hooks/useCategories";
import useAllProducts from "../hooks/useAllProducts";
import ProductCard from "../components/ProductCard";
import getImageUrl from "../utils/imageUtils";

import {
  Leaf,
  Star,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
} from "lucide-react";


// REUSABLE PRODUCT SECTION
function ProductSection({
  eyebrow,
  title,
  products = [],
  loading,
  error,
  emptyMessage,
  wishlistIds = [],
  wishlistLoadingIds = [],
  onToggleWishlist,
  handleAddToCart,
  addingId,
}) {
  return (
    <section className="bg-white py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-3 sm:mb-7">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-700 sm:text-sm">
              {eyebrow}
            </p>

            <h2 className="mt-1 text-2xl font-bold text-stone-900 sm:mt-2 sm:text-3xl">
              {title}
            </h2>
          </div>

          <Link
            to="/products"
            className="hidden items-center gap-2 text-sm font-semibold text-emerald-800 transition hover:text-emerald-950 sm:flex"
          >
            View All <ArrowRight size={17} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-2xl bg-stone-100 sm:h-80"
              />
            ))}
          </div>
        ) : error ? (
          <p className="rounded-2xl bg-stone-50 px-4 py-8 text-center text-sm text-red-600">
            {typeof error === "string"
              ? error
              : "Products load nahi ho paaye. Please try again."}
          </p>
        ) : products.length === 0 ? (
          <p className="rounded-2xl bg-stone-50 px-4 py-8 text-center text-sm text-stone-500">
            {emptyMessage}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {products.map((product) => {
              const id = String(product?._id || "");

              const isWishlisted = wishlistIds.some(
                (wishlistId) => String(wishlistId) === id
              );

              const isWishlistLoading = wishlistLoadingIds.some(
                (wishlistId) => String(wishlistId) === id
              );

              return (
                <ProductCard
                  key={id}
                  product={product}
                  isWishlisted={isWishlisted}
                  onToggleWishlist={onToggleWishlist}
                  wishlistLoading={isWishlistLoading}
                  onAddToCart={handleAddToCart}
                  addingToCart={String(addingId) === id}
                />
              );
            })}
          </div>
        )}

        <Link
          to="/products"
          className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-emerald-800 sm:hidden"
        >
          View All Products <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  // FETCH PRODUCTS
  const {
    products = [],
    loading,
    error: apiError,
  } = useAllProducts();

  // WISHLIST
  const {
    wishlistIds = [],
    wishlistLoadingIds = [],
    wishlistError,
    wishlistMessage,
    toggleWishlist,
  } = useWishlist();

  // CART
  const {
    addToCart,
    addingId,
    error: cartError,
    message: cartMessage,
  } = useCart();

  // CATEGORIES
  const {
    categories = [],
    loading: categoryLoading,
    error: categoryError,
  } = useCategories();

  // FEATURED PRODUCTS
  const featuredProducts = products.slice(0, 4);

  // BEST SELLERS: HIGHEST RATING FIRST
  const bestSellers = [...products]
    .sort(
      (a, b) => Number(b?.rating || 0) - Number(a?.rating || 0)
    )
    .slice(0, 4);

  // NEW ARRIVALS
  const newArrivals = [...products]
    .sort((a, b) => {
      const dateA = new Date(a?.createdAt || 0).getTime();
      const dateB = new Date(b?.createdAt || 0).getTime();

      return dateB - dateA;
    })
    .slice(0, 4);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#faf9f5] text-stone-800">
      {/* HERO */}
      <section className="overflow-hidden bg-[#e9f3e8]">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 md:grid-cols-2 md:gap-10 md:py-16 lg:px-8 lg:py-20">
          <div className="text-center md:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[11px] font-medium text-emerald-800 shadow-sm sm:mb-5 sm:px-4 sm:text-sm">
              <Sparkles size={14} />
              Clean skincare for everyday glow
            </div>

            <h1 className="mx-auto max-w-xl text-4xl font-bold leading-tight text-emerald-950 sm:text-5xl md:text-5xl lg:mx-0 lg:text-6xl">
              Healthy Skin,
              <span className="block text-emerald-700">
                Happier You.
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-stone-600 sm:mt-5 sm:text-base sm:leading-7 md:mx-0 lg:text-lg">
              Discover gentle, effective skincare made to nourish,
              hydrate and protect your skin every day.
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:mt-7 sm:flex-row md:justify-start">
              <Link
                to="/products"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 sm:w-auto sm:text-base"
              >
                Shop Now <ArrowRight size={18} />
              </Link>

              <Link
                to="/categories"
                className="inline-flex w-full items-center justify-center rounded-full border border-emerald-800 px-6 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-white sm:w-auto sm:text-base"
              >
                Explore Categories
              </Link>
            </div>

            <div className="mt-6 flex flex-col items-center gap-3 text-xs text-stone-600 sm:mt-7 sm:flex-row sm:justify-center sm:gap-6 sm:text-sm md:justify-start">
              <div className="flex items-center gap-2">
                <ShieldCheck size={17} className="text-emerald-700" />
                Quality Ingredients
              </div>

              <div className="flex items-center gap-2">
                <Truck size={17} className="text-emerald-700" />
                Free Shipping ₹999+
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="overflow-hidden rounded-3xl">
              <img
                src="https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=1000&q=85"
                alt="Clear Skin skincare"
                className="h-[300px] w-full object-cover sm:h-[400px] md:h-[440px] lg:h-[520px]"
              />
            </div>

            <div className="absolute bottom-3 left-3 rounded-xl bg-white/95 p-3 shadow-lg backdrop-blur sm:bottom-5 sm:left-5 sm:rounded-2xl sm:p-4">
              <p className="text-[10px] text-stone-500 sm:text-sm">
                Loved by skincare lovers
              </p>

              <div className="mt-1 flex items-center gap-1">
                <Star
                  size={14}
                  fill="currentColor"
                  className="text-yellow-500"
                />
                <span className="text-xs font-bold sm:text-base">
                  4.8/5
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section
        id="categories"
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16"
      >
        <div className="mb-6 flex items-end justify-between gap-3 sm:mb-7">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-700 sm:text-sm">
              Shop by category
            </p>

            <h2 className="mt-1 text-2xl font-bold text-stone-900 sm:mt-2 sm:text-3xl">
              Find Your Skincare
            </h2>
          </div>

          <Link
            to="/categories"
            className="hidden items-center gap-2 text-sm font-semibold text-emerald-800 sm:flex"
          >
            View All <ArrowRight size={17} />
          </Link>
        </div>

        {categoryLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-44 animate-pulse rounded-2xl bg-stone-200 sm:h-52"
              />
            ))}
          </div>
        ) : categoryError ? (
          <p className="rounded-2xl bg-white p-7 text-center text-sm text-red-600">
            {typeof categoryError === "string"
              ? categoryError
              : "Categories load nahi ho paayi."}
          </p>
        ) : categories.length === 0 ? (
          <p className="rounded-2xl bg-white p-7 text-center text-sm text-stone-500">
            No categories available. Admin se categories add karo.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
            {categories.slice(0, 5).map((category) => {
              const imageUrl = getImageUrl(
                category?.image || category?.img
              );

              return (
                <Link
                  key={category?._id || category?.id || category?.name}
                  to={`/products?category=${encodeURIComponent(
                    category?.name || ""
                  )}`}
                  className="group overflow-hidden rounded-xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:rounded-2xl"
                >
                  <div className="overflow-hidden bg-stone-100">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={category?.name || "Skincare category"}
                        loading="lazy"
                        className="h-32 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-44"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-32 items-center justify-center text-xs text-stone-400 sm:h-44">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="p-3 text-center sm:p-4">
                    <h3 className="line-clamp-1 text-sm font-semibold text-stone-800 group-hover:text-emerald-700 sm:text-base">
                      {category?.name}
                    </h3>

                    {category?.description && (
                      <p className="mt-1 hidden line-clamp-1 text-xs text-stone-500 sm:block">
                        {category.description}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <Link
          to="/categories"
          className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-emerald-800 sm:hidden"
        >
          View All Categories <ArrowRight size={17} />
        </Link>
      </section>

      {/* WISHLIST AND CART STATUS */}
      {(wishlistError || wishlistMessage || cartError || cartMessage) && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {(wishlistError || cartError) && (
            <p role="alert" className="mb-2 text-sm text-red-600">
              {wishlistError || cartError}
            </p>
          )}

          {(wishlistMessage || cartMessage) && (
            <p role="status" className="mb-2 text-sm text-emerald-700">
              {wishlistMessage || cartMessage}
            </p>
          )}
        </div>
      )}

      {/* FEATURED PRODUCTS */}
      <ProductSection
        eyebrow="Handpicked for you"
        title="Featured Products"
        products={featuredProducts}
        loading={loading}
        error={apiError}
        emptyMessage="No products available."
        wishlistIds={wishlistIds}
        wishlistLoadingIds={wishlistLoadingIds}
        onToggleWishlist={toggleWishlist}
        handleAddToCart={addToCart}
        addingId={addingId}
      />

      {/* BEST SELLERS */}
      <ProductSection
        eyebrow="Customer favourites"
        title="Best Sellers"
        products={bestSellers}
        loading={loading}
        error={apiError}
        emptyMessage="No best-selling products available."
        wishlistIds={wishlistIds}
        wishlistLoadingIds={wishlistLoadingIds}
        onToggleWishlist={toggleWishlist}
        handleAddToCart={addToCart}
        addingId={addingId}
      />

      {/* WHY CHOOSE US */}
      <section className="bg-[#edf5ec] py-10 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-9">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-700 sm:text-sm">
              Why Clear Skin
            </p>

            <h2 className="mt-1 text-2xl font-bold sm:mt-2 sm:text-3xl">
              Simple Skincare. Better Choices.
            </h2>

            <p className="mt-2 text-xs text-stone-600 sm:mt-3 sm:text-sm">
              We focus on effective skincare essentials designed for
              your everyday routine.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 text-center shadow-sm sm:p-7">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 sm:h-14 sm:w-14">
                <Leaf size={24} />
              </div>

              <h3 className="mt-4 text-base font-bold sm:mt-5 sm:text-lg">
                Thoughtful Ingredients
              </h3>

              <p className="mt-2 text-xs leading-6 text-stone-600 sm:text-sm">
                Carefully selected ingredients for gentle, effective
                everyday skincare.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 text-center shadow-sm sm:p-7">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 sm:h-14 sm:w-14">
                <ShieldCheck size={24} />
              </div>

              <h3 className="mt-4 text-base font-bold sm:mt-5 sm:text-lg">
                Quality Focused
              </h3>

              <p className="mt-2 text-xs leading-6 text-stone-600 sm:text-sm">
                Products made with quality and consistency in mind.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 text-center shadow-sm sm:p-7">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 sm:h-14 sm:w-14">
                <Truck size={24} />
              </div>

              <h3 className="mt-4 text-base font-bold sm:mt-5 sm:text-lg">
                Free Shipping
              </h3>

              <p className="mt-2 text-xs leading-6 text-stone-600 sm:text-sm">
                Enjoy free shipping on orders above ₹999.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <ProductSection
        eyebrow="Just arrived"
        title="New Arrivals"
        products={newArrivals}
        loading={loading}
        error={apiError}
        emptyMessage="No new products available."
        wishlistIds={wishlistIds}
        wishlistLoadingIds={wishlistLoadingIds}
        onToggleWishlist={toggleWishlist}
        handleAddToCart={addToCart}
        addingId={addingId}
      />

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-9">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-700 sm:text-sm">
            Customer reviews
          </p>

          <h2 className="mt-1 text-2xl font-bold sm:mt-2 sm:text-3xl">
            What Our Customers Say
          </h2>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {[
            {
              name: "Priya Sharma",
              text: "The moisturizer feels very light and keeps my skin hydrated throughout the day.",
            },
            {
              name: "Ananya Verma",
              text: "I really liked the Vitamin C serum. The packaging and product quality are excellent.",
            },
            {
              name: "Rahul Mehta",
              text: "Easy website, quick delivery and good products. Definitely ordering again.",
            },
          ].map((review) => (
            <div
              key={review.name}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7"
            >
              <div className="flex gap-1 text-yellow-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={15} fill="currentColor" />
                ))}
              </div>

              <p className="mt-4 text-sm leading-7 text-stone-600">
                &quot;{review.text}&quot;
              </p>

              <p className="mt-4 text-sm font-semibold text-stone-900">
                {review.name}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
