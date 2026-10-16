
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  image: "",
  category: "",
  stock: "",
  ingredients: "",
  benefits: "",
};

const getList = (data, key) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  return [];
};

const getErrorMessage = (data, fallback) =>
  data?.message || data?.error || fallback;

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(price) || 0);

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const token = localStorage.getItem("token");

  const authHeaders = useCallback(
    (json = false) => ({
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      ...(json ? { "Content-Type": "application/json" } : {}),
    }),
    []
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [productResponse, categoryResponse] = await Promise.all([
        fetch(`${API}/products`, {
          headers: authHeaders(),
        }),
        fetch(`${API}/categories`, {
          headers: authHeaders(),
        }),
      ]);

      const [productData, categoryData] = await Promise.all([
        productResponse.json(),
        categoryResponse.json(),
      ]);

      if (!productResponse.ok) {
        throw new Error(
          getErrorMessage(productData, "Products load nahi hue.")
        );
      }

      if (!categoryResponse.ok) {
        throw new Error(
          getErrorMessage(categoryData, "Categories load nahi hui.")
        );
      }

      setProducts(getList(productData, "products"));
      setCategories(getList(categoryData, "categories"));
    } catch (err) {
      setError(err.message || "Server se connect nahi ho pa raha.");
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openAddForm = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      category: categories[0]?._id || "",
    });
    setError("");
    setNotice("");
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      image: product.image || "",
      category:
        typeof product.category === "object"
          ? product.category?._id || ""
          : product.category || "",
      stock: product.stock ?? "",
      ingredients: Array.isArray(product.ingredients)
        ? product.ingredients.join(", ")
        : "",
      benefits: Array.isArray(product.benefits)
        ? product.benefits.join(", ")
        : "",
    });
    setError("");
    setNotice("");
    setShowForm(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    if (!token) {
      setError("Login session nahi mila. Dobara login karein.");
      setSaving(false);
      return;
    }

    if (!form.category) {
      setError("Pehle product ki category select karein.");
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      image: form.image.trim(),
      category: form.category,
      stock: Number(form.stock),
      ingredients: form.ingredients
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      benefits: form.benefits
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    if (
      !payload.name ||
      !payload.description ||
      !payload.image ||
      !Number.isFinite(payload.price) ||
      payload.price < 0 ||
      !Number.isInteger(payload.stock) ||
      payload.stock < 0
    ) {
      setError(
        "Sabhi required fields sahi bharein. Price aur stock valid hone chahiye."
      );
      setSaving(false);
      return;
    }

    try {
      const isEditing = Boolean(editingId);
      const url = isEditing
        ? `${API}/products/${editingId}`
        : `${API}/products/add`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: authHeaders(true),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Product save nahi hua.")
        );
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setNotice(
        isEditing
          ? "Product successfully update ho gaya."
          : "Product successfully add ho gaya."
      );

      await loadData();
    } catch (err) {
      setError(err.message || "Product save nahi hua.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `"${product.name}" ko delete karna chahte ho?`
    );

    if (!confirmed) return;

    setDeletingId(product._id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API}/products/${product._id}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Product delete nahi hua.")
        );
      }

      setProducts((previous) =>
        previous.filter((item) => item._id !== product._id)
      );
      setNotice("Product successfully delete ho gaya.");
    } catch (err) {
      setError(err.message || "Product delete nahi hua.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter((product) => {
    const query = search.trim().toLowerCase();
    const categoryName =
      typeof product.category === "object"
        ? product.category?.name || ""
        : categories.find((category) => category._id === product.category)
            ?.name || "";

    const matchesSearch =
      !query ||
      product.name?.toLowerCase().includes(query) ||
      categoryName.toLowerCase().includes(query);

    const stock = Number(product.stock) || 0;
    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && stock <= 5) ||
      (stockFilter === "available" && stock > 5) ||
      (stockFilter === "out" && stock === 0);

    return matchesSearch && matchesStock;
  });

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-[#dfe5d8] bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#527b58] focus:ring-2 focus:ring-[#527b58]/10";

  return (
    <div className="min-h-screen bg-[#f8f7f1] text-gray-800">
      <header className="sticky top-0 z-20 border-b border-[#e5e9de] bg-[#fffef9]">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#315c40] text-xl text-white"
              title="Back to dashboard"
            >
              ←
            </Link>
            <div>
              <p className="text-xs text-gray-500">
                Clear Skin / Admin
              </p>
              <h1 className="text-xl font-bold text-[#315c40] sm:text-2xl">
                Product Management
              </h1>
            </div>
          </div>

          <button
            onClick={openAddForm}
            className="rounded-xl bg-[#315c40] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#244831]"
          >
            + Add Product
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] p-4 sm:p-8">
        <section className="mb-6 rounded-2xl bg- p-6 text-white shadow-lg sm:p-7">
  <p className="text-sm font-semibold text-gray-600">
    Store inventory
  </p>

  <h2 className="mt-2 text-2xl font-extrabold text-gray-600">
    Manage your skincare products 🌿
  </h2>

  <p className="mt-2 text-sm font-medium text-gray-500">
    Add new products, update details and keep stock under control.
  </p>

  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
    <div className="rounded-xl border border-white/20 bg-[#245238] p-4">
      <p className="text-sm font-semibold text-white">
        Total Products
      </p>
      <p className="mt-1 text-2xl font-bold text-white">
        {loading ? "—" : products.length}
      </p>
    </div>

    <div className="rounded-xl border border-white/20 bg-[#245238] p-4">
      <p className="text-sm font-semibold text-white">
        Low Stock (≤ 5)
      </p>
      <p className="mt-1 text-2xl font-bold text-white">
        {loading
          ? "—"
          : products.filter((product) => Number(product.stock) <= 5).length}
      </p>
    </div>

    <div className="col-span-2 rounded-xl border border-white/20 bg-[#245238] p-4 sm:col-span-1">
      <p className="text-sm font-semibold text-white">
        Categories
      </p>
      <p className="mt-1 text-2xl font-bold text-white">
        {loading ? "—" : categories.length}
      </p>
    </div>
  </div>
</section>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {notice && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            {notice}
          </div>
        )}

        {showForm && (
          <section className="mb-8 rounded-2xl border border-[#e5e9de] bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[#315c40]">
                  {editingId ? "Edit Product" : "Add New Product"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Product details carefully fill karein.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100"
              >
                Close ✕
              </button>
            </div>

            {categories.length === 0 && (
              <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                Pehle Category Management se ek category add karein.
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <label className="text-sm font-medium">
                  Product Name *
                  <input
                    className={inputClass}
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Vitamin C Serum"
                    required
                  />
                </label>

                <label className="text-sm font-medium">
                  Category *
                  <select
                    className={inputClass}
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-medium">
                  Price (₹) *
                  <input
                    className={inputClass}
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="499"
                    required
                  />
                </label>

                <label className="text-sm font-medium">
                  Stock Quantity *
                  <input
                    className={inputClass}
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    placeholder="50"
                    required
                  />
                </label>

                <label className="text-sm font-medium md:col-span-2">
                  Product Image URL *
                  <input
                    className={inputClass}
                    type="url"
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="https://example.com/product.jpg"
                    required
                  />
                  <span className="mt-1 block text-xs font-normal text-gray-500">
                    Abhi image URL use hota hai; file upload is form mein nahi hai.
                  </span>
                </label>

                {form.image && (
                  <div className="md:col-span-2">
                    <p className="mb-2 text-sm font-medium">
                      Image Preview
                    </p>
                    <img
                      src={form.image}
                      alt="Product preview"
                      className="h-32 w-32 rounded-xl border border-gray-200 object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}

                <label className="text-sm font-medium md:col-span-2">
                  Description *
                  <textarea
                    className={inputClass}
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Describe the product..."
                    required
                  />
                </label>

                <label className="text-sm font-medium">
                  Ingredients
                  <textarea
                    className={inputClass}
                    name="ingredients"
                    value={form.ingredients}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Vitamin C, Aloe Vera, Niacinamide"
                  />
                  <span className="mt-1 block text-xs font-normal text-gray-500">
                    Comma se separate karein.
                  </span>
                </label>

                <label className="text-sm font-medium">
                  Benefits
                  <textarea
                    className={inputClass}
                    name="benefits"
                    value={form.benefits}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Brightening, Hydration, Soft skin"
                  />
                  <span className="mt-1 block text-xs font-normal text-gray-500">
                    Comma se separate karein.
                  </span>
                </label>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving || categories.length === 0}
                  className="rounded-xl bg-[#315c40] px-6 py-3 text-sm font-semibold text-white hover:bg-[#244831] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Product"
                    : "Save Product"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-[#e5e9de] bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-lg font-bold">All Products</h2>
              <p className="mt-1 text-sm text-gray-500">
                {loading
                  ? "Loading products..."
                  : `${filteredProducts.length} products found`}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search product or category..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#527b58] sm:w-64"
              />

              <select
                value={stockFilter}
                onChange={(event) => setStockFilter(event.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#527b58]"
              >
                <option value="all">All Stock</option>
                <option value="available">In Stock (&gt; 5)</option>
                <option value="low">Low Stock (≤ 5)</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-gray-500">
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-3xl">🌿</p>
              <h3 className="mt-3 font-semibold">
                No products found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Search change karein ya naya product add karein.
              </p>
              <button
                onClick={openAddForm}
                className="mt-5 rounded-xl bg-[#315c40] px-5 py-3 text-sm font-semibold text-white"
              >
                + Add Product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-[#f7f8f3] text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Product</th>
                    <th className="px-5 py-4 font-semibold">Category</th>
                    <th className="px-5 py-4 font-semibold">Price</th>
                    <th className="px-5 py-4 font-semibold">Stock</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => {
                    const categoryName =
                      typeof product.category === "object"
                        ? product.category?.name
                        : categories.find(
                            (category) =>
                              category._id === product.category
                          )?.name;

                    const stock = Number(product.stock) || 0;

                    return (
                      <tr
                        key={product._id}
                        className="transition hover:bg-[#fbfcf8]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-14 w-14 rounded-xl border border-gray-100 bg-gray-50 object-cover"
                              onError={(event) => {
                                event.currentTarget.style.visibility = "hidden";
                              }}
                            />
                            <div className="max-w-xs">
                              <p className="font-semibold text-gray-800">
                                {product.name}
                              </p>
                              <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-[#edf2e8] px-3 py-1.5 text-xs font-medium text-[#315c40]">
                            {categoryName || "Uncategorized"}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-semibold">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                              stock === 0
                                ? "bg-red-50 text-red-700"
                                : stock <= 5
                                ? "bg-amber-50 text-amber-700"
                                : "bg-green-50 text-green-700"
                            }`}
                          >
                            {stock === 0
                              ? "Out of stock"
                              : `${stock} units`}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditForm(product)}
                              className="rounded-lg border border-[#dce5d8] px-3 py-2 text-xs font-semibold text-[#315c40] hover:bg-[#edf2e8]"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product)}
                              disabled={deletingId === product._id}
                              className="rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              {deletingId === product._id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
