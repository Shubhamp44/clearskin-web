
import api from "../services/api";

// SERVER BASE URL (without /api)
const BASE_URL = api.defaults.baseURL.replace(/\/api$/i, "");

// CONVERT IMAGE PATH TO FULL URL
const getImageUrl = (image) => {
  if (!image || typeof image !== "string") {
    return "";
  }

  const url = image.trim();

  // If image URL is already complete, return it
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Convert relative image path to full URL
  return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

export default getImageUrl;
