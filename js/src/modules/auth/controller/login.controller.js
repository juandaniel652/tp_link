import { loginRequest } from "../service/login.service.js";
import { tokenStorage } from "../../../core/storage/tokenStorage.js";

export function initLogin() {
  const container = document.getElementById("loginContainer");
  const form = document.getElementById("loginForm");
  const usuario = document.getElementById("usuario");
  const password = document.getElementById("password");
  const errorDiv = document.getElementById("error");

  if (!form) return;

  const button = form.querySelector("button");
  const buttonText = document.getElementById("buttonText");

  if (container) container.classList.add("animate-in");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    ocultarError();

    const email = usuario.value.trim();
    const pass = password.value.trim();

    if (!email || !pass) return mostrarError("Todos los campos son obligatorios.");

    buttonText.textContent = "Verificando...";
    button.disabled = true;

    try {
      const data = await loginRequest(email, pass);
      
      if (data && data.access_token) {
        tokenStorage.setToken(data.access_token);

        // --- LÓGICA DE REDIRECCIÓN INTELIGENTE ---
        const isProduction = window.location.hostname !== 'localhost';
        const defaultPath = isProduction ? '/agenda/index.html' : '/index.html';
        
        // Intentamos obtener la ruta guardada por el guardián
        const savedPath = sessionStorage.getItem("redirect_after_login");
        const REDIRECT_PATH = savedPath || defaultPath;

        // Limpiamos la variable para que no afecte futuros logins
        sessionStorage.removeItem("redirect_after_login");

        console.log("Login exitoso. Redirigiendo a:", REDIRECT_PATH);
        window.location.replace(REDIRECT_PATH);
      }
    } catch (err) {
      mostrarError(err.message);
      buttonText.textContent = "ACCEDER";
      button.disabled = false;
    }
  });

  function mostrarError(mensaje) {
    errorDiv.textContent = mensaje;
    errorDiv.classList.remove("hidden");
  }

  function ocultarError() {
    errorDiv.classList.add("hidden");
    errorDiv.textContent = "";
  }
}