import { tokenStorage } from "../storage/tokenStorage.js";

export function requireAuth() {
  const token = tokenStorage.getToken();

  if (!token || token === "null" || token === "undefined") {
    tokenStorage.removeToken();
    // CAMBIO: Ruta absoluta desde la raíz del sitio
    window.location.replace("/agenda/html/login.html");
    return false;
  }

  if (_tokenVencido(token)) {
    tokenStorage.removeToken();
    // CAMBIO: Ruta absoluta
    window.location.replace("/agenda/html/login.html");
    return false;
  }

  return true;
}

export function logout() {
  tokenStorage.removeToken();
  // CAMBIO: Ruta absoluta
  window.location.href = "/agenda/html/login.html";
}

// ----------------------------------------------------------
// Helper — decodifica exp del JWT sin librerías
// ----------------------------------------------------------
function _tokenVencido(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return false;
    return payload.exp < Math.floor(Date.now() / 1000);
  } catch {
    return true; // si no se puede decodificar → tratar como vencido
  }
}