



import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import useCategories from "../hooks/useCategories";
import getImageUrl from "../utils/imageUtils";



const Categories = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const {
    categories = [],
    loading,
    error,
    fetchCategories,
  } = useCategories();

  const filteredCategories = categories.filter((category) =>
    category.name?.toLowerCase().includes(search.trim().toLowerCase())
  );

  const openCategory = (category) => {
    navigate(
      `/products?category=${encodeURIComponent(category.name)}`
    );
  };

  return (
    <main className="min-h-screen bg-[#faf9f5]">
      {/* Category Heading and Search */}
      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-green-800">
              Clear Skin Collections
            </p>

            <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
              Shop by Category
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Find the right essentials for your skincare routine.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search categories..."
              aria-label="Search categories"
              className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="mx-auto max-w-7xl px-4 pb-9 sm:px-6">
        {loading ? (
          <p className="py-12 text-center text-sm text-gray-500">
            Loading categories...
          </p>
        ) : error ? (
          <div className="rounded-xl bg-white p-8 text-center">
            <p className="text-sm font-medium text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchCategories}
              className="mt-3 text-sm font-semibold text-green-800 underline"
            >
              Try again
            </button>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center">
            <p className="text-sm font-medium text-gray-800">
              No categories found
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Try searching with a different name.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {filteredCategories.map((category) => {
              const image = category.img || category.image;

              return (
                <article
                  key={
                    category._id ||
                    category.id ||
                    category.name
                  }
                  className="group overflow-hidden rounded-xl border border-[#eeece4] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <button
                    type="button"
                    onClick={() => openCategory(category)}
                    className="block w-full text-left"
                  >
                    {/* Category Image */}
                    <div className="relative h-32 overflow-hidden bg-[#f0eee8] sm:h-40">
                      {image ? (
                        <img
                          src={getImageUrl(image)}
                          alt={category.name || "Skincare category"}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-gray-400">
                          No image available
                        </div>
                      )}

                      <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-green-900 shadow-sm transition group-hover:bg-green-800 group-hover:text-white">
                        <ArrowRight size={16} />
                      </span>
                    </div>

                    {/* Category Details */}
                    <div className="p-3 sm:p-4">
                      <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
                        {category.name}
                      </h2>

                      <p className="mt-1 line-clamp-2 min-h-8 text-xs leading-4 text-gray-500">
                        {category.description ||
                          "Explore skincare essentials for your daily routine."}
                      </p>

                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-green-800">
                        Explore
                        <ArrowRight
                          size={13}
                          className="transition group-hover:translate-x-1"
                        />
                      </span>
                    </div>
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Bottom Banner */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <div className="flex flex-col justify-between gap-3 rounded-2xl bg-[#eaf2e4] p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Your skin, your routine.
            </h2>

            <p className="mt-1 text-xs text-gray-600">
              Discover your everyday skincare essentials.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-green-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-900"
          >
            Shop Products
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Categories;
