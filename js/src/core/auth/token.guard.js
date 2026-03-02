import { tokenStorage } from "@/core/storage/tokenStorage.js";
import { apiRequest } from "@/core/api/apiRequest.js";



export async function checkAuth() {
  const token = tokenStorage.getToken();
  tokenStorage.getToken()
  tokenStorage.setToken(token)


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