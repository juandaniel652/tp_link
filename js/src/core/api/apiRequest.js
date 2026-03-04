// core/api/apiRequest.js

import { tokenStorage } from "@/core/storage/tokenStorage.js";

const API_BASE_URL = "https://agenda-1-zomu.onrender.com/api/v1";

export async function apiRequest(endpoint, options = {}) {
  const token = tokenStorage.getToken();

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    tokenStorage.removeToken();
    window.location.href = "/html/login.html"; // PRODUCCIÓN
    return;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail || "Error de servidor");
  }

  return data;
}