// js/src/core/auth/token.guard.js

import { getToken, setToken, removeToken } from "@/core/storage/tokenStorage.js";

const LOGIN_URL = "https://loginagenda.netlify.app/";
const API_ME = "https://agenda-1-zomu.onrender.com/api/v1/auth/me";

export async function checkAuth() {
  const params = new URLSearchParams(window.location.search);
  const tokenFromUrl = params.get("token");

  if (tokenFromUrl) {
    setToken(tokenFromUrl);
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  const token = getToken();

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

    const user = await response.json();
    console.log("Usuario autenticado:", user);

    return true;

  } catch (error) {
    removeToken();
    window.location.replace(LOGIN_URL);
    return false;
  }
}