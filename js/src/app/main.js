import { checkAuth } from "@/core/auth/token.guard.js";
import { initTurnos } from "@/modules/turnos/index.js";
import { initClientes } from "@/modules/clientes/index.js";
import { initTecnicos } from "@/modules/tecnicos/index.js";

document.addEventListener("DOMContentLoaded", async () => {

  // 1️⃣ Capturar token desde URL
  const params = new URLSearchParams(window.location.search);
  const tokenFromUrl = params.get("token");

  if (tokenFromUrl) {
    localStorage.setItem("access_token", tokenFromUrl);
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // 2️⃣ Validar
  const isAuthenticated = await checkAuth();
  console.log("isAuthenticated:", isAuthenticated);

  if (!isAuthenticated) return;

  // 3️⃣ Inicializar módulos
  initTurnos();
  initClientes();
  initTecnicos();
});