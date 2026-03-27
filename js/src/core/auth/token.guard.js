import { tokenStorage } from "../storage/tokenStorage.js";

// Definimos la ruta base una sola vez para evitar errores
const LOGIN_URL = "https://andros-net.com.ar/agenda/html/login.html";

export function requireAuth() {
  const token = tokenStorage.getToken();

  // 1. Si no existe el token
  if (!token || token === "null" || token === "undefined") {
    tokenStorage.removeToken();
    window.location.replace(LOGIN_URL);
    return false;
  }

  // 2. Si el token está vencido
  if (_tokenVencido(token)) {
    tokenStorage.removeToken();
    window.location.replace(LOGIN_URL);
    return false;
  }

  return true;
}

export function logout() {
  tokenStorage.removeToken();
  window.location.href = LOGIN_URL;
}

function _tokenVencido(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return false;
    return payload.exp < Math.floor(Date.now() / 1000);
  } catch {
    return true; 
  }
}