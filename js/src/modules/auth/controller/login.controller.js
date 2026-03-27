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
          
      if (data && data.access_token) {
          tokenStorage.setToken(data.access_token);
          
          const isProduction = window.location.hostname !== 'localhost';
          // Aseguramos que en producción vaya a /agenda/index.html
          const REDIRECT_PATH = isProduction ? '/agenda/index.html' : '/index.html';
          
          console.log("Login exitoso, redirigiendo a:", REDIRECT_PATH);
          window.location.replace(REDIRECT_PATH); // replace es mejor para no volver atrás al login
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