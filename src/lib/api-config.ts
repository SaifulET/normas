export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:5000/api/v1/" : "https://api.early-n.com/api/v1/");
