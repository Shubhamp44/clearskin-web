
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  RefreshCw,
  Users,
  ShieldCheck,
  UserRound,
  Eye,
  Pencil,
  Trash2,
  X,
  LoaderCircle,
  Mail,
  Phone,
} from "lucide-react";

const API = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"
).replace(/\/+$/, "");

const getUsersArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    role: "user",
  });

  let currentUser = null;

  try {
    currentUser = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    currentUser = null;
  }

  const currentUserId = currentUser?._id || currentUser?.id;

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/users`, {
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Users load nahi ho paye.");
      }

      setUsers(getUsersArray(data));
    } catch (err) {
      setError(err.message || "Users fetch karne mein problem hui.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const text = [
        user.fullName,
        user.name,
        user.email,
        user.phone,
        user.role,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
      const matchesRole =
        roleFilter === "All" ||
        String(user.role || "user").toLowerCase() ===
          roleFilter.toLowerCase();

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const adminCount = users.filter(
    (user) => user.role?.toLowerCase() === "admin"
  ).length;

  const customerCount = users.filter(
    (user) => (user.role || "user").toLowerCase() === "user"
  ).length;

  const openEdit = (user) => {
    setError("");
    setMessage("");
    setEditingUser(user);

    setForm({
      fullName: user.fullName || user.name || "",
      phone: user.phone || "",
      role: user.role || "user",
    });
  };

  const closeEdit = () => {
    setEditingUser(null);
    setForm({ fullName: "", phone: "", role: "user" });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editingUser?._id) {
      setError("User ID nahi mila.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API}/users/${editingUser._id}`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({
            fullName: form.fullName.trim(),
            phone: form.phone.trim(),
            role: form.role,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "User details update nahi hui."
        );
      }

      const updatedUser = data.user || data.data || {};

      setUsers((previous) =>
        previous.map((user) =>
          user._id === editingUser._id
            ? { ...user, ...updatedUser, ...form }
            : user
        )
      );

      if (
        String(editingUser._id) === String(currentUserId) &&
        form.role !== currentUser?.role
      ) {
        setMessage(
          "Aapne apna role change kiya hai. Login permissions update karne ke liye dobara login karna pad sakta hai."
        );
      } else {
        setMessage("User details successfully update ho gayi.");
      }

      closeEdit();
    } catch (err) {
      setError(err.message || "User update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!user._id) {
      setError("User ID nahi mila.");
      return;
    }

    if (String(user._id) === String(currentUserId)) {
      setError("Aap apna admin account yahan se delete nahi kar sakte.");
      return;
    }

    const confirmed = window.confirm(
      `Kya aap "${user.fullName || user.name || user.email}" ko delete karna chahte hain?`
    );

    if (!confirmed) return;

    setUpdatingId(user._id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/users/${user._id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "User delete nahi hua.");
      }

      setUsers((previous) =>
        previous.filter((item) => item._id !== user._id)
      );

      if (selectedUser?._id === user._id) {
        setSelectedUser(null);
      }

      setMessage("User successfully delete ho gaya.");
    } catch (err) {
      setError(err.message || "User delete failed.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8f2] px-4 py-6 text-[#243b2d] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Top navigation */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#245238] hover:bg-green-50"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <button
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#245238] hover:bg-green-50 disabled:opacity-60"
          >
            <RefreshCw size={16} />
            Refresh Users
          </button>
        </div>

        {/* Dark green header */}
        <section className="mb-6 rounded-2xl bg-[#163d2a] p-6 text-white shadow-lg sm:p-7">
          <p className="text-sm font-semibold text-white">
            Store administration
          </p>

          <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl  text-yellow-100">
            User Management 
          </h1>

          <p className="mt-2 text-sm leading-6  text-yellow-100">
            View registered customers and manage user information.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/20 bg-[#245238] p-4">
              <Users size={23} />
              <p className="mt-3 text-sm font-semibold text-white">
                Total Users
              </p>
              <p className="mt-1 text-2xl font-extrabold">
                {loading ? "—" : users.length}
              </p>
            </div>

            <div className="rounded-xl border border-white/20 bg-[#245238] p-4">
              <UserRound size={23} />
              <p className="mt-3 text-sm font-semibold text-white">
                Customers
              </p>
              <p className="mt-1 text-2xl font-extrabold">
                {loading ? "—" : customerCount}
              </p>
            </div>

            <div className="rounded-xl border border-white/20 bg-[#245238] p-4">
              <ShieldCheck size={23} />
              <p className="mt-3 text-sm font-semibold text-white">
                Admin Accounts
              </p>
              <p className="mt-1 text-2xl font-extrabold">
                {loading ? "—" : adminCount}
              </p>
            </div>
          </div>
        </section>

        {/* Notifications */}
        {message && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            <span>{error}</span>
            <button onClick={() => setError("")} aria-label="Close error">
              <X size={17} />
            </button>
          </div>
        )}

        {/* Search and filters */}
        <section className="mb-6 rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-[#163d2a]">
                Registered Users
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Search users and manage their details.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, phone..."
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100 sm:w-72"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-700"
              >
                <option value="All">All Roles</option>
                <option value="user">Customers</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>
        </section>

        {/* Users table */}
        <section className="overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-56 items-center justify-center gap-3 text-[#245238]">
              <LoaderCircle className="animate-spin" size={25} />
              <span className="font-medium">Loading users...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <Users
                size={40}
                className="mx-auto mb-3 text-green-800"
              />
              <h3 className="text-lg font-bold text-[#163d2a]">
                No users found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Try another search or role filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-[#edf3e9] text-xs uppercase tracking-wide text-[#245238]">
                  <tr>
                    <th className="px-5 py-4">User</th>
                    <th className="px-5 py-4">Contact</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">User ID</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-green-50/50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e9f0e6] font-extrabold text-[#245238]">
                            {(user.fullName || user.name || user.email || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="font-bold text-[#163d2a]">
                              {user.fullName || user.name || "Unnamed User"}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {user.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={15} />
                          {user.phone || "Not provided"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                            user.role?.toLowerCase() === "admin"
                              ? "bg-purple-50 text-purple-700"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.role?.toLowerCase() === "admin" ? (
                            <ShieldCheck size={14} />
                          ) : (
                            <UserRound size={14} />
                          )}
                          {user.role || "user"}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-gray-500">
                        {user._id
                          ? `${user._id.slice(0, 12)}...`
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            title="View user"
                            className="rounded-lg bg-[#e9f0e6] p-2.5 text-[#245238] hover:bg-green-200"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            onClick={() => openEdit(user)}
                            title="Edit user"
                            className="rounded-lg bg-amber-50 p-2.5 text-amber-700 hover:bg-amber-100"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => handleDelete(user)}
                            disabled={
                              updatingId === user._id ||
                              String(user._id) === String(currentUserId)
                            }
                            title={
                              String(user._id) === String(currentUserId)
                                ? "You cannot delete your own account here"
                                : "Delete user"
                            }
                            className="rounded-lg bg-red-50 p-2.5 text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {updatingId === user._id ? (
                              <LoaderCircle
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* View user modal */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
            <div className="my-auto w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
              <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-[#163d2a]">
                    User Details
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Registered account information
                  </p>
                </div>

                <button
                  onClick={() => setSelectedUser(null)}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                  aria-label="Close details"
                >
                  <X size={21} />
                </button>
              </div>

              <div className="mb-5 flex items-center gap-4 rounded-xl bg-[#edf3e9] p-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#245238] text-xl font-extrabold text-white">
                  {(
                    selectedUser.fullName ||
                    selectedUser.name ||
                    selectedUser.email ||
                    "U"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="min-w-0">
                  <h3 className="break-words font-extrabold text-[#163d2a]">
                    {selectedUser.fullName ||
                      selectedUser.name ||
                      "Unnamed User"}
                  </h3>
                  <span className="mt-1 inline-block rounded-full bg-white px-3 py-1 text-xs font-bold capitalize text-[#245238]">
                    {selectedUser.role || "user"}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-xl border border-gray-100 p-4">
                  <Mail size={18} className="mt-0.5 text-[#245238]" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Email Address</p>
                    <p className="mt-1 break-all font-semibold text-gray-800">
                      {selectedUser.email || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-gray-100 p-4">
                  <Phone size={18} className="mt-0.5 text-[#245238]" />
                  <div>
                    <p className="text-xs text-gray-500">Phone Number</p>
                    <p className="mt-1 font-semibold text-gray-800">
                      {selectedUser.phone || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 p-4">
                  <p className="text-xs text-gray-500">User ID</p>
                  <p className="mt-1 break-all font-mono text-sm text-gray-800">
                    {selectedUser._id || "—"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="mt-6 w-full rounded-xl bg-[#163d2a] px-4 py-3 font-bold text-white hover:bg-[#245238]"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Edit user modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
            <div className="my-auto w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
              <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-[#163d2a]">
                    Edit User
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Update account information.
                  </p>
                </div>

                <button
                  onClick={closeEdit}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                  aria-label="Close edit form"
                >
                  <X size={21} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Full Name *
                  </label>
                  <input
                    value={form.fullName}
                    onChange={(e) =>
                      setForm({ ...form, fullName: e.target.value })
                    }
                    required
                    maxLength={100}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    maxLength={20}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Role
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-700"
                  >
                    <option value="user">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                  <p className="mt-1.5 text-xs text-gray-500">
                    Admin role sirf trusted accounts ko assign karein.
                  </p>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={closeEdit}
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-xl bg-[#163d2a] px-4 py-3 text-sm font-bold text-white hover:bg-[#245238] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Changes"}
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

export default AdminUsers;
