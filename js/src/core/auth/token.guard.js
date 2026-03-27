// agenda/js/src/core/auth/token.guard.js

import { tokenStorage } from "../storage/tokenStorage.js";

export function requireAuth() {
  const token = tokenStorage.getToken();

  // Si no hay token o es inválido
  if (!token || token === "null" || token === "undefined") {
    console.warn("[Guard] No hay token — Redirigiendo a Login");
    tokenStorage.removeToken();
    // USAMOS LA RUTA QUE CONFIRMASTE QUE FUNCIONA
    window.location.replace("https://andros-net.com.ar/agenda/html/login.html");
    return false;
  }

  // Verificar si expiró
  if (_tokenVencido(token)) {
    console.warn("[Guard] Token expirado — Redirigiendo a Login");
    tokenStorage.removeToken();
    window.location.replace("https://andros-net.com.ar/agenda/html/login.html");
    return false;
  }

  return true;
}

export function logout() {
  tokenStorage.removeToken();
  window.location.href = "https://andros-net.com.ar/agenda/html/login.html";
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