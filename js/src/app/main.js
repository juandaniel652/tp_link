import { checkAuth } from "@/core/auth/token.guard.js";
import { initTurnos } from "@/modules/turnos/index.js";
import { initClientes } from "@/modules/clientes/index.js";
import { initTecnicos } from "@/modules/tecnicos/index.js";

document.addEventListener("DOMContentLoaded", async () => {

  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) return;

  initTurnos();
  initClientes();
  initTecnicos();
});