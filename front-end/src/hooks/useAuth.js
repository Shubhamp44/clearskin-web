
import { useState, useCallback } from "react";
import api from "../services/api";

const getSavedUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const useAuth = () => {
  const [user, setUser] = useState(getSavedUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // LOGIN
  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/auth/login", credentials);
      const data = response.data;

      const token =
        data.token ||
        data.accessToken ||
        data.data?.token;

      const loggedInUser =
        data.user ||
        data.data?.user;

      if (!token) {
        throw new Error("Login response mein token nahi mila.");
      }

      localStorage.setItem("token", token);

      if (loggedInUser) {
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        setUser(loggedInUser);
      }

      setSuccess(data.message || "Login successful!");

      return { success: true, user: loggedInUser };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Login failed.";

      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // REGISTER
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/auth/register", userData);

      setSuccess(
        response.data?.message || "Registration successful!"
      );

      return { success: true, data: response.data };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Registration failed.";

      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // LOGOUT
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setError("");
    setSuccess("");
  }, []);

  // CLEAR MESSAGES
  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  return {
    user,
    loading,
    error,
    success,
    login,
    register,
    logout,
    clearMessages,
    isAuthenticated: Boolean(localStorage.getItem("token")),
  };
};

export default useAuth;
