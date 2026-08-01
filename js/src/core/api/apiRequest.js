// core/api/apiRequest.js

import { tokenStorage } from "../storage/tokenStorage.js";
import {API_URL} from "../../core/config/api.js";


export async function apiRequest(endpoint, options = {}) {
  const token = tokenStorage.getToken();

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
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
  // Si detail es un array (típico de FastAPI), sacamos el primer mensaje
  const msg = Array.isArray(data?.detail) 
    ? data.detail[0].msg 
    : (data?.detail || "Error de servidor");
  throw new Error(msg);
  }

  return data;
}