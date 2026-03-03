import { tokenStorage } from "@/core/storage/tokenStorage.js";

export function requireAuth() {
  const token = tokenStorage.getToken();

  if (!token || token === "null" || token === "undefined") {
    tokenStorage.removeToken();
    window.location.replace("../html/login.html");
    return false;
  }

  return true;
}

export function logout() {
  tokenStorage.removeToken();
  window.location.href = "../html/login.html";
}