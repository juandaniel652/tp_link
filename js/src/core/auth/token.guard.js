import { tokenStorage } from "../storage/tokenStorage.js";

const isProduction = window.location.hostname !== 'localhost';
const BASE_PATH = isProduction ? '/agenda' : '';
const LOGIN_PAGE = `${BASE_PATH}/html/login.html`;

export function requireAuth() {
  // --- CLAVE PARA ROMPER EL BUCLE ---
  // Si ya estamos en login o registro, no validamos nada, salimos de la función.
  const pathActual = window.location.pathname;
  if (pathActual.includes("login.html") || pathActual.includes("register.html") || pathActual.includes("recuperacion.html")) {
    return true; 
  }

  const token = tokenStorage.getToken();

  // Si no hay token o está vencido
  if (!token || token === "null" || token === "undefined" || _tokenVencido(token)) {
    tokenStorage.removeToken();
    
    // Evitamos redirección infinita si ya estamos intentando ir al login
    if (!pathActual.includes("login.html")) {
        window.location.replace(LOGIN_PAGE);
    }
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