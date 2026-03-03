import { requireAuth } from "@/core/auth/token.guard.js";
import { initTurnos } from "@/modules/turnos/index.js";
import { initClientes } from "@/modules/clientes/index.js";
import { initTecnicos } from "@/modules/tecnicos/index.js";

document.addEventListener("DOMContentLoaded", async () => {

  const isAuthenticated = requireAuth();
  if (!isAuthenticated) return;

  if (document.querySelector("#turnosContainer")) {
    initTurnos();
  }

  if (document.querySelector("#clientesTable")) {
    initClientes();
  }

  if (document.querySelector("#formGeneral")) {
    initTecnicos();
  }

});