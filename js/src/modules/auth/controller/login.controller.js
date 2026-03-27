import { loginRequest } from "../service/login.service.js";
import { tokenStorage } from "../../../core/storage/tokenStorage.js";

export function initLogin() {

  const container = document.getElementById("loginContainer");
  const form = document.getElementById("loginForm");
  const usuario = document.getElementById("usuario");
  const password = document.getElementById("password");
  const errorDiv = document.getElementById("error");

  if (!form) return; // Seguridad

  const button = form.querySelector("button");
  const buttonText = document.getElementById("buttonText");

  // Animación segura
  if (container) {
    container.classList.add("animate-in");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    ocultarError();

    const email = usuario.value.trim();
    const pass = password.value.trim();

    if (!email || !pass) {
      return mostrarError("Todos los campos son obligatorios.");
    }

    buttonText.textContent = "Verificando...";
    button.disabled = true;

    try {
      const data = await loginRequest(email, pass);
      console.log("LOGIN RESPONSE:", data);
      
      // Guardamos el token
      tokenStorage.setToken(data.access_token);
      
      const isProduction = window.location.hostname !== 'localhost';
      const REDIRECT_PATH = isProduction ? '/agenda/index.html' : '/index.html';
      
      // CAMBIO CLAVE: Usamos 'data' porque 'response' no está definido aquí
      if (data && data.access_token) {
          window.location.href = REDIRECT_PATH;
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