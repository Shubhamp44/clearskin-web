
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Layers,
  Image as ImageIcon,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

const API =
  (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/+$/, "");

const getToken = () => localStorage.getItem("token");

const getCategoriesArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.categories)) return data.categories;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    name: "",
    description: "",
    img: "",
  };

  const [form, setForm] = useState(emptyForm);

  const requestHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  });

  const fetchCategories = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/categories`, {
        headers: requestHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Categories load nahi ho payi.");
      }

      setCategories(getCategoriesArray(data));
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((category) =>
    `${category.name || ""} ${category.description || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
    setShowForm(true);
  };

  const openEditForm = (category) => {
    setEditingId(category._id);
    setForm({
      name: category.name || "",
      description: category.description || "",
      img: category.img || "",
    });
    setMessage("");
    setError("");
    setShowForm(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const url = editingId
        ? `${API}/categories/${editingId}`
        : `${API}/categories/add`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: requestHeaders(),
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          img: form.img.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Category save nahi hui.");
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      setMessage(
        editingId
          ? "Category successfully update ho gayi."
          : "New category successfully add ho gayi."
      );

      await fetchCategories();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `"${category.name}" category delete karni hai?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/categories/${category._id}`, {
        method: "DELETE",
        headers: requestHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Category delete nahi hui.");
      }

      setCategories((previous) =>
        previous.filter((item) => item._id !== category._id)
      );
      setMessage("Category successfully delete ho gayi.");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8f2] px-4 py-6 text-[#243b2d] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Top navigation */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#245238] transition hover:bg-green-50"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

        
        </div>

        {/* Dark green header */}
        <section className="mb-6 rounded-2xl bg-[#163d2a] p-6 text-white shadow-lg sm:p-7">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold  text-yellow-100">
                Store organization
              </p>

              <h1 className="mt-2 text-2xl font-extrabold text-yellow-100  sm:text-3xl">
                Category Management 🌿
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6  text-yellow-100">
                Create, update and organize your skincare product categories.
              </p>
            </div>

            <button
              onClick={openAddForm}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-[#163d2a] transition hover:bg-green-100"
            >
              <Plus size={19} />
              Add Category
            </button>
          </div>

          <div className="mt-6 max-w-sm rounded-xl border border-white/20 bg-[#245238] p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white/15 p-3">
                <Layers size={23} />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  Total Categories
                </p>
                <p className="mt-1 text-2xl font-extrabold text-white">
                  {loading ? "—" : categories.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Messages */}
        {message && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-green-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#163d2a]">
              All Categories
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Search and manage your skincare categories.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>

        {/* Categories */}
        {loading ? (
          <div className="flex min-h-52 items-center justify-center gap-3 rounded-2xl bg-white text-[#245238]">
            <LoaderCircle className="animate-spin" size={24} />
            <span className="font-medium">Loading categories...</span>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="rounded-2xl border border-green-100 bg-white px-5 py-14 text-center">
            <Layers className="mx-auto mb-3 text-green-800" size={36} />
            <h3 className="text-lg font-bold text-[#163d2a]">
              No categories found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {search
                ? "Try another search term."
                : "Click Add Category to create your first category."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredCategories.map((category) => (
              <article
                key={category._id}
                className="overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative flex h-48 items-center justify-center overflow-hidden bg-[#e9f0e6]">
                  {category.img ? (
                    <img
                      src={category.img}
                      alt={category.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-[#245238]">
                      <ImageIcon size={38} />
                      <span className="text-sm font-medium">
                        No category image
                      </span>
                    </div>
                  )}

                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#245238] shadow-sm">
                    Category
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-extrabold text-[#163d2a]">
                    {category.name}
                  </h3>

                  <p className="mt-2 min-h-10 text-sm leading-5 text-gray-600">
                    {category.description || "No description added."}
                  </p>

                  <div className="mt-5 flex gap-3 border-t border-gray-100 pt-4">
                    <button
                      onClick={() => openEditForm(category)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#e9f0e6] px-3 py-2.5 text-sm font-bold text-[#245238] transition hover:bg-green-200"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(category)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Add / Edit modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
            <div className="my-auto w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
              <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-[#163d2a]">
                    {editingId ? "Edit Category" : "Add New Category"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Enter the category details below.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowForm(false);
                    setError("");
                  }}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  aria-label="Close form"
                >
                  <X size={21} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Face Wash"
                    required
                    maxLength={100}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe this category..."
                    rows={3}
                    maxLength={1000}
                    className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Category Image URL
                  </label>
                  <input
                    type="url"
                    name="img"
                    value={form.img}
                    onChange={handleChange}
                    placeholder="https://example.com/category.jpg"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    Paste an image URL. File upload is not enabled here.
                  </p>
                </div>

                {error && (
                  <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setError("");
                    }}
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-xl bg-[#163d2a] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#245238] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                      ? "Update Category"
                      : "Save Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
