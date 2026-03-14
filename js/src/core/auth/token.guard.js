import { tokenStorage } from "@/core/storage/tokenStorage.js";

export function requireAuth() {
  const token = tokenStorage.getToken();

  if (!token || token === "null" || token === "undefined") {
    tokenStorage.removeToken();
    window.location.replace("../html/login.html");
    return false;
  }

  // ← Verificar expiración del JWT
  if (_tokenVencido(token)) {
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