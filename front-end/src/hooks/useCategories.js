
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchCategories = async () => {
      try {
        setLoading(true);

        const response = await api.get("/categories/", {
          signal: controller.signal,
        });

        const data = response.data;

        const list = Array.isArray(data)
          ? data
          : data?.categories ||
            data?.results ||
            data?.data?.categories ||
            data?.data ||
            [];

        setCategories(Array.isArray(list) ? list : []);
        setError("");
      } catch (err) {
        if (
          axiosCanceled(err) ||
          err.code === "ERR_CANCELED"
        ) {
          return;
        }

        console.error("Categories fetch error:", err);

        const errorMessage =
          "Could not load categories. Please try again.";

        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchCategories();

    return () => controller.abort();
  }, []);

  return {
    categories,
    loading,
    error,
    setCategories,
  };
};

const axiosCanceled = (err) =>
  err.name === "CanceledError";

export default useCategories;
