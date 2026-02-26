import { checkAuth } from "@/core/auth/token.guard.js";
import { initTurnos } from "@/modules/turnos/index.js";

import {
  obtenerTurnos,
  obtenerTurnosPorFecha
} from "../modules/turnos/service/turnos.api.js";

import {
  renderHistorialTurnos
} from "../modules/turnos/view/turnos.historial.view.js";

document.addEventListener("DOMContentLoaded", async () => {
  const isAuth = await checkAuth();
  if (!isAuth) return;

  initTurnos();
});