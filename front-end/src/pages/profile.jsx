

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import api from "../services/api";
import {
  Leaf,
  UserRound,
  Mail,
  Phone,
  LockKeyhole,
  ShieldCheck,
  Edit3,
  Save,
  X,
  LogOut,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react";



const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await api.get(
          "/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const profile = response.data.user || response.data;

        setUser(profile);
        setFormData({
          ...initialForm,
          fullName: profile.fullName || "",
          email: profile.email || "",
          phone: profile.phone || "",
        });
      } catch (err) {
        console.error("Profile fetch error:", err);
        console.error("Backend response:", err.response?.data);

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login", { replace: true });
          return;
        }

        setError(
          err.response?.data?.message ||
            "Unable to load profile. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const resetForm = () => {
    setFormData({
      ...initialForm,
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
  };

  const cancelEditing = () => {
    resetForm();
    setEditing(false);
    setError("");
    setSuccess("");
  };

  // Update name, phone and optionally password
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.fullName.trim()) {
      
      toast.error("Please enter your full name.");
      return;
    }

    if (!formData.phone.trim()) {
      
            toast.error("Please enter your mobile number..");

      return;
    }

    const changingPassword =
      formData.currentPassword !== "" ||
      formData.newPassword !== "" ||
      formData.confirmPassword !== "";

    if (changingPassword) {
      if (
        !formData.currentPassword ||
        !formData.newPassword ||
        !formData.confirmPassword
      ) {
         toast.error("Please fill in all three password fields.");
        return;
      }

      if (formData.newPassword.length < 6) {
         toast.error("New password must be at least 6 characters.");
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
         toast.error("New password and confirm password do not match.");
        return;
      }

      if (formData.currentPassword === formData.newPassword) {
         toast.error("New password must differ from current password.");
        return;
      }
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    // Email is intentionally not sent.
    const payload = {
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
    };

    if (changingPassword) {
      payload.currentPassword = formData.currentPassword;
      payload.newPassword = formData.newPassword;
    }

    try {
      setSaving(true);

      const response = await api.put(
        "/users/updateprofile"  ,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = response.data.user || response.data;

      setUser((prev) => ({
        ...prev,
        ...updatedUser,
      }));

      // Keep cached user information synchronized.
      const cachedUser = localStorage.getItem("user");

      if (cachedUser) {
        try {
          const parsedUser = JSON.parse(cachedUser);

          localStorage.setItem(
            "user",
            JSON.stringify({
              ...parsedUser,
              fullName: updatedUser.fullName,
              phone: updatedUser.phone,
            })
          );
        } catch (cacheError) {
          console.error("Unable to update cached user:", cacheError);
        }
      }

      setFormData({
        ...initialForm,
        fullName: updatedUser.fullName || "",
        email: updatedUser.email || user.email || "",
        phone: updatedUser.phone || "",
      });

      setEditing(false);
      
      toast.success(
  response.data.message || "Profile updated successfully!"
);
    } catch (err) {
      console.error("Profile update error:", err);
      console.error("Backend response:", err.response?.data);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const inputClass =
    "w-full rounded-xl border border-stone-200 bg-[#fcfbf8] py-3 pl-11 pr-4 text-sm text-stone-800 outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-700/10 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500";

  const passwordClass =
    "w-full rounded-xl border border-stone-200 bg-[#fcfbf8] py-3 pl-11 pr-12 text-sm text-stone-800 outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-700/10 disabled:opacity-60";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8f4]">
        <div className="text-center">
          <Leaf
            size={36}
            className="mx-auto mb-3 animate-pulse text-green-800"
          />
          <p className="text-sm text-stone-600">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#faf8f4] px-4">
        <AlertCircle size={38} className="text-red-500" />
        <p className="text-center text-red-700">
          {error || "Unable to load your profile."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-[#304b39] px-5 py-3 text-sm text-white hover:bg-[#243b2c]"
        >
          Try Again
        </button>
        <Link to="/" className="text-sm text-green-800 underline">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f4] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-green-800 hover:text-green-950"
        >
          <ArrowLeft size={17} />
          Back to Home
        </Link>

        <div className="overflow-hidden rounded-3xl border border-stone-100 bg-white shadow-xl shadow-stone-200/50">
          {/* Profile header */}
          <div className="relative overflow-hidden bg-[#304b39] px-6 py-8 text-white sm:px-10 sm:py-10">
            <div className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-2 -top-8 h-36 w-36 rounded-full border border-white/10" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10">
                  <UserRound size={38} />
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[2px] text-green-100">
                    <Leaf size={15} />
                    Clear Skin Account
                  </div>

                  <h1 className="text-2xl font-semibold  text-yellow-100 sm:text-3xl">
                    {user.fullName || "My Profile"}
                  </h1>

                  <p className="mt-2 text-sm text-green-100">
                    Manage your personal information
                  </p>
                </div>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
                <ShieldCheck size={17} />
                <span className="capitalize">
                  {user.role || "user"} Account
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-10">
            {/* Error notification */}
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success notification */}
            {success && (
              <div
                role="status"
                className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
              >
                <CheckCircle size={19} className="mt-0.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-stone-800">
                    Personal Information
                  </h2>
                  <p className="mt-1 text-sm text-stone-500">
                    Update your name, mobile number and password.
                  </p>
                </div>

                {!editing ? (
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setSuccess("");
                      setEditing(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-200 px-5 py-3 text-sm font-semibold text-green-800 transition hover:bg-green-50"
                  >
                    <Edit3 size={17} />
                    Edit Profile
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 px-5 py-3 text-sm font-medium text-stone-600 hover:bg-stone-50 disabled:opacity-60"
                  >
                    <X size={17} />
                    Cancel
                  </button>
                )}
              </div>

              {/* Name, email and phone */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-medium text-stone-700"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <UserRound
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-900"
                    />
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleChange}
                      disabled={!editing || saving}
                      required
                      maxLength={80}
                      autoComplete="name"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-900"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-900"
                    />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      disabled
                      readOnly
                      autoComplete="email"
                      className={inputClass}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-900">
                    Email cannot be changed here.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-gray-900"
                  >
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                    />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!editing || saving}
                      required
                      autoComplete="tel"
                      maxLength={15}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Account Role
                  </label>
                  <div className="flex min-h-[46px] items-center gap-3 rounded-xl border border-stone-200 bg-stone-100 px-4 py-3">
                    <ShieldCheck size={18} className="text-green-800" />
                    <span className="text-sm capitalize text-stone-600">
                      {user.role || "user"}
                    </span>
                    <span className="ml-auto text-xs text-stone-400">
                      Protected
                    </span>
                  </div>
                </div>
              </div>

              {/* Password change */}
              {editing && (
                <div className="mt-9 border-t border-stone-100 pt-7">
                  <h3 className="text-lg font-semibold text-stone-800">
                    Change Password
                  </h3>
                  <p className="mt-1 mb-5 text-sm leading-6 text-stone-500">
                    Leave all password fields empty if you do not want to
                    change your password.
                  </p>

                  <div className="grid gap-5 sm:grid-cols-2">
                    {/* Current password */}
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="currentPassword"
                        className="mb-2 block text-sm font-medium text-stone-700"
                      >
                        Current Password
                      </label>
                      <div className="relative">
                        <LockKeyhole
                          size={18}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                        />
                        <input
                          id="currentPassword"
                          name="currentPassword"
                          type={showCurrent ? "text" : "password"}
                          value={formData.currentPassword}
                          onChange={handleChange}
                          disabled={saving}
                          autoComplete="current-password"
                          placeholder="Enter current password"
                          className={passwordClass}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrent(!showCurrent)}
                          aria-label={
                            showCurrent ? "Hide password" : "Show password"
                          }
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500"
                        >
                          {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* New password */}
                    <div>
                      <label
                        htmlFor="newPassword"
                        className="mb-2 block text-sm font-medium text-stone-700"
                      >
                        New Password
                      </label>
                      <div className="relative">
                        <LockKeyhole
                          size={18}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                        />
                        <input
                          id="newPassword"
                          name="newPassword"
                          type={showNew ? "text" : "password"}
                          value={formData.newPassword}
                          onChange={handleChange}
                          disabled={saving}
                          autoComplete="new-password"
                          minLength={6}
                          placeholder="Minimum 6 characters"
                          className={passwordClass}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew(!showNew)}
                          aria-label={
                            showNew ? "Hide password" : "Show password"
                          }
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500"
                        >
                          {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm password */}
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="mb-2 block text-sm font-medium text-stone-700"
                      >
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <LockKeyhole
                          size={18}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                        />
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirm ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          disabled={saving}
                          autoComplete="new-password"
                          minLength={6}
                          placeholder="Re-enter new password"
                          className={passwordClass}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          aria-label={
                            showConfirm ? "Hide password" : "Show password"
                          }
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500"
                        >
                          {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save and cancel */}
              {editing && (
                <div className="mt-8 flex flex-col gap-3 border-t border-stone-100 pt-6 sm:flex-row">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#304b39] px-7 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#243b2c] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={18} />
                    {saving ? "Saving Changes..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={saving}
                    className="rounded-xl border border-stone-200 px-7 py-3.5 text-sm font-medium text-stone-600 hover:bg-stone-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>

            {/* Logout */}
            <div className="mt-9 flex flex-col gap-4 border-t border-stone-100 pt-7 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-stone-800">
                  Sign out
                </h3>
                <p className="mt-1 text-sm text-stone-500">
                  Logout from your Clear Skin account.
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-stone-400">
          Clear Skin · Care for your natural glow
        </p>
      </div>
    </div>
  );
}
