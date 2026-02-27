import { bootstrapProtectedPage } from "@/core/auth/bootstrap.js";
import { initTurnos } from "@/modules/turnos/index.js";

document.addEventListener("DOMContentLoaded", () => {
  bootstrapProtectedPage(initTurnos);
});