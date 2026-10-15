
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  SlidersHorizontal,
  Search,
} from "lucide-react";

import useAllProducts from "../hooks/useAllProducts";
import useWishlist from "../hooks/useWishlist";
import useCart from "../hooks/useCart";
import ProductCard from "../components/ProductCard";

export default function Products() {
  // FETCH PRODUCTS
  const {
    products = [],
    loading,
    error,
    refetchProducts,
  } = useAllProducts();

  // URL SEARCH PARAMETERS
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "All";

  // WISHLIST
  const {
    wishlistIds = [],
    wishlistLoadingIds = [],
    toggleWishlist,
  } = useWishlist();

  // CART
  const {
    addToCart,
    addingId,
  } = useCart();

  // FILTER STATES
  const [category, setCategory] = useState(categoryParam);
  const [sort, setSort] = useState("latest");
  const [showFilters, setShowFilters] = useState(false);

  // SYNC CATEGORY WITH URL
  useEffect(() => {
    setCategory(categoryParam);
  }, [categoryParam]);

  // UNIQUE CATEGORIES
  const categories = useMemo(() => {
    const categoryNames = products
      .map((product) => {
        if (typeof product?.category === "string") {
          return product.category;
        }

        return product?.category?.name;
      })
      .filter(Boolean);

    return ["All", ...new Set(categoryNames)];
  }, [products]);

  // SEARCH + CATEGORY FILTER + SORT
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // SEARCH
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();

      result = result.filter((product) => {
        const name = product?.name?.toLowerCase() || "";
        const description =
          product?.description?.toLowerCase() || "";

        const categoryName =
          typeof product?.category === "string"
            ? product.category
            : product?.category?.name || "";

        return (
          name.includes(query) ||
          description.includes(query) ||
          categoryName.toLowerCase().includes(query)
        );
      });
    }

    // CATEGORY
    if (category !== "All") {
      result = result.filter((product) => {
        const productCategory =
          typeof product?.category === "string"
            ? product.category
            : product?.category?.name || "";

        return (
          productCategory.toLowerCase() ===
          category.toLowerCase()
        );
      });
    }

    // SORT
    if (sort === "priceLow") {
      result.sort(
        (a, b) =>
          Number(a?.price || 0) - Number(b?.price || 0)
      );
    }

    if (sort === "priceHigh") {
      result.sort(
        (a, b) =>
          Number(b?.price || 0) - Number(a?.price || 0)
      );
    }

    if (sort === "rating") {
      result.sort(
        (a, b) =>
          Number(b?.rating || 0) - Number(a?.rating || 0)
      );
    }

    if (sort === "latest") {
      result.sort((a, b) => {
        const dateA = new Date(a?.createdAt || 0).getTime();
        const dateB = new Date(b?.createdAt || 0).getTime();

        return dateB - dateA;
      });
    }

    return result;
  }, [products, category, sort, searchQuery]);

  // CATEGORY CHANGE
  const handleCategoryChange = (value) => {
    setCategory(value);

    const params = new URLSearchParams(searchParams);

    if (value !== "All") {
      params.set("category", value);
    } else {
      params.delete("category");
    }

    setSearchParams(params);
  };

  // CLEAR FILTERS
  const clearFilters = () => {
    setCategory("All");
    setSort("latest");
    setSearchParams({});
  };

  return (
    <main className="min-h-screen bg-[#faf9f5] text-stone-800">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        {/* MOBILE FILTER BUTTON */}
        <div className="mb-5 md:hidden">
          <button
            type="button"
            onClick={() =>
              setShowFilters((previous) => !previous)
            }
            aria-expanded={showFilters}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 shadow-sm"
          >
            <SlidersHorizontal size={18} />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {/* FILTER PANEL */}
        <div
          className={`
            mb-8 rounded-2xl border border-stone-200
            bg-white p-4 sm:p-5
            ${showFilters ? "block" : "hidden"}
            md:block
          `}
        >
          <div className="grid gap-5 md:grid-cols-2">
            {/* CATEGORY FILTER */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-stone-700">
                Filter by Category
              </label>

              <div className="flex flex-wrap gap-2">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleCategoryChange(item)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                      category === item
                        ? "bg-emerald-800 text-white"
                        : "bg-stone-100 text-stone-700 hover:bg-emerald-100 hover:text-emerald-800"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* SORT FILTER */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-stone-700">
                Sort Products
              </label>

              <select
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value)
                }
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="latest">Latest Products</option>
                <option value="priceLow">
                  Price: Low to High
                </option>
                <option value="priceHigh">
                  Price: High to Low
                </option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* CLEAR FILTERS */}
          {(category !== "All" ||
            sort !== "latest" ||
            searchQuery) && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 text-sm font-semibold text-red-600 transition hover:text-red-800"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* PAGE TITLE AND COUNT */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-stone-900 sm:text-2xl">
              {searchQuery
                ? `Search: ${searchQuery}`
                : category !== "All"
                  ? category
                  : "All Products"}
            </h1>

            <p className="mt-1 text-xs text-stone-500 sm:text-sm">
              {filteredProducts.length} product
              {filteredProducts.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-2xl bg-stone-200 sm:h-80"
              />
            ))}
          </div>
        )}

        {/* ERROR MESSAGE */}
        {!loading && error && (
          <div className="rounded-2xl bg-white p-8 text-center sm:p-10">
            <p className="font-semibold text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={refetchProducts}
              className="mt-4 rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-900"
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY PRODUCTS */}
        {!loading &&
          !error &&
          filteredProducts.length === 0 && (
            <div className="rounded-2xl bg-white px-5 py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <Search
                  size={25}
                  className="text-emerald-700"
                />
              </div>

              <h2 className="mt-4 text-lg font-bold text-stone-800">
                No Products Found
              </h2>

              <p className="mt-2 text-sm text-stone-500">
                Try a different search or category.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-full bg-emerald-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900"
              >
                Show All Products
              </button>
            </div>
          )}

        {/* SHARED PRODUCT CARD GRID */}
        {!loading &&
          !error &&
          filteredProducts.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => {
                const id = String(product?._id || "");

                return (
                  <ProductCard
                    key={id}
                    product={product}
                    isWishlisted={wishlistIds.includes(id)}
                    onToggleWishlist={toggleWishlist}
                    wishlistLoading={wishlistLoadingIds.includes(id)}
                    onAddToCart={addToCart}
                    addingToCart={
                      String(addingId) === id
                    }
                  />
                );
              })}
            </div>
          )}
      </section>
    </main>
  );
}
