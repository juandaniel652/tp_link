import { loginRequest } from "./login.service.js";
import { setToken } from "@/core/storage/tokenStorage.js";

const form = document.getElementById("loginForm");
const usuario = document.getElementById("usuario");
const password = document.getElementById("password");
const errorDiv = document.getElementById("error");
const button = form.querySelector("button");
const buttonText = document.getElementById("buttonText");

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

    // ✅ Guardar token en el MISMO dominio
    setToken(data.access_token);

    // ✅ Redirigir dentro del mismo proyecto
    window.location.href = "/index.html";

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