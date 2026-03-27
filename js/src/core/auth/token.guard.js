import { tokenStorage } from "../storage/tokenStorage.js";

const isProduction = window.location.hostname !== 'localhost';
const BASE_PATH = isProduction ? '/agenda' : '';
const LOGIN_PAGE = `${BASE_PATH}/html/login.html`;

export function requireAuth() {
  const pathActual = window.location.pathname;

  // 1. Si ya estamos en una página de acceso, no validamos nada
  if (pathActual.includes("login.html") || pathActual.includes("register.html") || pathActual.includes("recuperacion.html")) {
    return true;
  }

  const token = tokenStorage.getToken();

  // 2. Si no hay token o está vencido
  if (!token || token === "null" || token === "undefined" || _tokenVencido(token)) {
    
    // GUARDAMOS LA RUTA ACTUAL PARA VOLVER LUEGO
    // No guardamos si la ruta es el index o el propio login
    if (!pathActual.includes("login.html") && pathActual !== BASE_PATH + "/") {
        sessionStorage.setItem("redirect_after_login", pathActual);
    }

    tokenStorage.removeToken();
    window.location.replace(LOGIN_PAGE);
    return false;
  }

  return true;
}

export function logout() {
  tokenStorage.removeToken();
  sessionStorage.removeItem("redirect_after_login"); // Limpiamos por seguridad
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