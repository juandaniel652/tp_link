// js/src/core/auth/token.guard.js
import { tokenStorage } from "../storage/tokenStorage.js";

// Detectamos si estamos en producción (cPanel) o local
const isProduction = window.location.hostname !== 'localhost';
const BASE_PATH = isProduction ? '/agenda' : '';
const LOGIN_PAGE = `${BASE_PATH}/html/login.html`;

export function requireAuth() {
  const token = tokenStorage.getToken();

  if (!token || token === "null" || token === "undefined" || _tokenVencido(token)) {
    tokenStorage.removeToken();
    // Usamos replace para no ensuciar el historial
    window.location.replace(LOGIN_PAGE);
    return false;
  }
  return true;
}

export function logout() {
  tokenStorage.removeToken();
  window.location.href = LOGIN_PAGE;
}

function _tokenVencido(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp < Math.floor(Date.now() / 1000) : false;
  } catch {
    return true;
  }
}