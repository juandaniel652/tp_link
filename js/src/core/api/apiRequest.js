import { tokenStorage } from "@/core/storage/tokenStorage.js";

const API_BASE_URL = "https://agenda-1-zomu.onrender.com";

export async function apiRequest(endpoint, options = {}) {
  const token = tokenStorage.getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    if (response.status === 401) {
      tokenStorage.removeToken();
      window.location.href = "/login.html"; // LOCAL
    }

    const error = await response.json();
    throw new Error(error.detail || "Error de servidor");
  }

  return response.json();
}