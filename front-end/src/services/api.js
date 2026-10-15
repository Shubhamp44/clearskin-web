
import axios from "axios";

const API = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"
).replace(/\/$/, "");

const api = axios.create({
  baseURL: API,
});

export default api;