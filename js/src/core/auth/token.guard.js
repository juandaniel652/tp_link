import { tokenStorage } from "@/core/storage/tokenStorage.js";

const LOGIN_URL = "https://loginagenda.netlify.app/";
const API_ME = "https://agenda-1-zomu.onrender.com/api/v1/auth/me";

export async function checkAuth() {
  const params = new URLSearchParams(window.location.search);
  const tokenFromUrl = params.get("token");

  if (tokenFromUrl) {
    tokenStorage.setToken(tokenFromUrl);
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  const token = tokenStorage.getToken();

  if (!token) {
    window.location.replace(LOGIN_URL);
    return false;
  }

  try {
    const response = await fetch(API_ME, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Token inválido");

    return true;

  } catch (error) {
    tokenStorage.removeToken();
    window.location.replace(LOGIN_URL);
    return false;
  }
}