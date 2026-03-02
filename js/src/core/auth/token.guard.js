import { tokenStorage } from "@/core/storage/tokenStorage.js";

export function requireAuth() {
  const token = tokenStorage.getToken();

  if (!token) {
    window.location.href = "/login.html";
  }
}

export function logout() {
  tokenStorage.removeToken();
  window.location.href = "/login.html";
}