import { tokenStorage } from "@/core/storage/tokenStorage.js";

export function requireAuth() {
  const token = tokenStorage.getToken();
  console.log("TOKEN EN GUARD:", token);

  if (!token) {
    console.log("REDIRIGIENDO A LOGIN...");
    window.location.href = "/login.html";
    return false;
  }

  return true;
}

export function logout() {
  tokenStorage.removeToken();
  window.location.href = "/login.html";
}