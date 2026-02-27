import { checkAuth } from "@/core/auth/token.guard.js";
import { initTurnos } from "@/modules/turnos/index.js";

document.addEventListener("DOMContentLoaded", async () => {
  const isAuth = await checkAuth();
  if (!isAuth) return;

  initTurnos();
});