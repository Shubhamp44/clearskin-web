
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
  Heart
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
      
<section className="relative overflow-hidden bg-[#101B15] text-[#EDF3E9]">
  {/* Background Glow */}
  <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-[#416B49]/20 blur-3xl" />

  <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-4 py-7 sm:px-6 sm:py-9 md:grid-cols-2 md:gap-8 lg:px-8 lg:py-11">

    {/* =========================
        LEFT CONTENT
    ========================= */}
    <div className="relative z-10 text-center md:text-left">

      {/* Badge */}
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#405943] bg-[#1D3324] px-3 py-1.5 text-[11px] font-medium text-[#D5E8CB] sm:px-4 sm:py-2 sm:text-xs">
        <Sparkles size={14} className="text-[#B9D7A9]" />
        Clean skincare for everyday glow
      </div>

      {/* Heading */}
      <h1 className="mx-auto max-w-xl text-3xl font-bold leading-[1.1] tracking-tight text-[#F2F5ED] sm:text-4xl md:mx-0 md:text-4xl lg:text-5xl">
        Healthy Skin,
        <span className="block text-[#B9D7A9]">
          Happier You.
        </span>
      </h1>

      {/* Description */}
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#C4D1C1] sm:text-base md:mx-0">
        Discover gentle, effective skincare made to nourish,
        hydrate and protect your skin every day.
      </p>

      {/* Buttons */}
      <div className="mt-4 flex flex-col justify-center gap-2.5 sm:flex-row md:justify-start">
        <Link
          to="/products"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#B9D7A9] px-6 py-2.5 text-sm font-semibold text-[#142318] transition hover:bg-[#D0E6C3] sm:w-auto"
        >
          Shop Now
          <ArrowRight size={17} />
        </Link>

        <Link
          to="/categories"
          className="inline-flex w-full items-center justify-center rounded-full border border-[#789570] px-6 py-2.5 text-sm font-semibold text-[#EDF3E9] transition hover:bg-[#203B29] sm:w-auto"
        >
          Explore Categories
        </Link>
      </div>

      {/* Features */}
      <div className="mt-4 flex flex-col items-center justify-center gap-2.5 text-xs text-[#C4D1C1] sm:flex-row sm:gap-5 sm:text-sm md:justify-start">
        <div className="flex items-center gap-1.5">
          <ShieldCheck
            size={16}
            className="text-[#B9D7A9]"
          />
          Quality Ingredients
        </div>

        <span className="hidden h-5 border-l border-[#405543] sm:block" />

        <div className="flex items-center gap-1.5">
          <Truck
            size={17}
            className="text-[#B9D7A9]"
          />
          Free Shipping ₹999+
        </div>
      </div>
    </div>

    {/* =========================
        RIGHT IMAGE
    ========================= */}
    <div className="relative mx-auto w-full max-w-lg">

      {/* Glow */}
      <div className="pointer-events-none absolute -inset-4 rounded-full bg-[#416B49]/20 blur-3xl" />

      {/* Image Card */}
      <div className="relative overflow-hidden rounded-[24px] border border-[#354A39] bg-[#19291F] shadow-xl">

        <img
          src="https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=1000&q=85"
          alt="Premium Clear Skin skincare products"
          className="h-[230px] w-full object-cover sm:h-[280px] md:h-[300px] lg:h-[350px]"
          loading="eager"
        />

        {/* Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101B15]/90 via-transparent to-transparent" />

        {/* Image Bottom Content */}
        <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/10 bg-[#142219]/90 p-3 backdrop-blur-md sm:bottom-4 sm:left-4 sm:right-4 sm:p-4">
          <div className="flex items-center justify-between gap-3">

            <div>
              <p className="text-[9px] font-medium tracking-wider text-[#B9D7A9] sm:text-[10px]">
                YOUR DAILY SKINCARE RITUAL
              </p>

              <h2 className="mt-0.5 text-sm font-semibold text-[#F2F5ED] sm:text-base">
                Nature meets science.
              </h2>

              <p className="mt-0.5 text-[10px] text-[#C4D1C1] sm:text-xs">
                Nourish. Hydrate. Glow.
              </p>
            </div>

            <div className="shrink-0 rounded-lg bg-[#B9D7A9] p-2 text-[#142318]">
              <Leaf size={20} />
            </div>

          </div>
        </div>
      </div>

      {/* Rating Card */}
      <div className="absolute -bottom-3 left-3 flex items-center gap-3 rounded-xl border border-[#405543] bg-[#19291F] px-3 py-2.5 shadow-lg sm:bottom-3 sm:left-4">
        <div>
          <p className="text-[10px] font-medium text-[#EDF3E9] sm:text-xs">
            Loved by skincare lovers
          </p>

          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="text-[11px] tracking-wide text-amber-400">
              ★★★★★
            </span>

            <span className="text-[10px] text-[#C4D1C1] sm:text-xs">
              4.8/5
            </span>
          </div>
        </div>

        <div className="rounded-full bg-[#304638] p-2 text-[#C6DDAA]">
          <Heart size={15} />
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
