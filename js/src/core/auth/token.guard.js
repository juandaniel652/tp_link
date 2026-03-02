import { getToken, removeToken } from "@/core/storage/tokenStorage.js";
import { apiRequest } from "@/core/api/apiRequest.js";

export async function checkAuth() {
  const token = getToken();

  if (!token) {
    window.location.replace("/html/login.html");
    return false;
  }

  try {
    await apiRequest("/auth/me");
    return true;
  } catch (err) {
    removeToken();
    window.location.replace("/html/login.html");
    return false;
  }
}