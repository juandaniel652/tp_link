import { requireAuth } from "@/core/auth/token.guard.js";
import { initTurnos } from "@/modules/turnos";
import { initClientes } from "@/modules/clientes";
import { initTecnicos } from "@/modules/tecnicos";

document.addEventListener("DOMContentLoaded", () => {

  if (!requireAuth()) return;

  if (document.querySelector("#turnosContainer")) initTurnos();
  if (document.querySelector("#clientesTable")) initClientes();
  if (document.querySelector("#formGeneral")) initTecnicos();

});