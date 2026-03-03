import { loginRequest } from "../service/login.service.js";
import { tokenStorage } from "@/core/storage/tokenStorage.js";

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

  const token = tokenStorage.getToken();
  if (token) {
    window.location.href = "../html/index.html";
    return;
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
      tokenStorage.setToken(data.access_token);
      console.log("RESPONSE COMPLETA:", data);
      console.log("TOKEN GUARDADO:", localStorage.getItem("access_token"));
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