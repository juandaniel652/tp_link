// js/src/app/main.js
import { requireAuth }    from "@/core/auth/token.guard.js";
import { sessionManager } from "@/core/auth/session.manager.js";
import { tokenStorage }   from "@/core/storage/tokenStorage.js";

function getRoleFromToken() {
  try {
    const token = tokenStorage.getToken();
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role ?? null;
  } catch {
    return null;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[main] DOMContentLoaded — arrancando");

  if (!requireAuth()) {
    console.warn("[main] requireAuth falló — redirigiendo");
    return;
  }

  console.log("[main] Auth OK");
  sessionManager.init(null);

  const role = getRoleFromToken();
  console.log("[main] Rol detectado:", role);

  // ── Turnos ────────────────────────────────────────────────
  if (document.querySelector("#turnosContainer")) {
    console.log("[main] Página de turnos detectada — cargando módulo...");
    try {
      const { initTurnos } = await import("@/modules/turnos/index.js");
      console.log("[main] initTurnos importado OK");
      await initTurnos();
      console.log("[main] initTurnos ejecutado OK");
    } catch (e) {
      console.error("[main] ERROR en módulo turnos:", e);
    }
  }

  // ── Clientes ──────────────────────────────────────────────
  if (role === "admin" && document.querySelector("#clientesTable")) {
    console.log("[main] Página de clientes detectada — cargando módulo...");
    try {
      const { initClientes } = await import("@/modules/clientes/index.js");
      await initClientes();
    } catch (e) {
      console.error("[main] ERROR en módulo clientes:", e);
    }
  }

  // ── Técnicos ──────────────────────────────────────────────
  if (role === "admin" && document.querySelector("#formGeneral")) {
    console.log("[main] Página de técnicos detectada — cargando módulo...");
    try {
      const { initTecnicos } = await import("@/modules/tecnicos/index.js");
      await initTecnicos();
    } catch (e) {
      console.error("[main] ERROR en módulo técnicos:", e);
    }
  }

  // ── Agenda ────────────────────────────────────────────────
  if (role === "admin" && document.querySelector("#agendaContainer")) {
    console.log("[main] Página de agenda detectada — cargando módulo...");
    try {
      const { initAgenda } = await import("@/modules/agenda/index.js");
      await initAgenda();
    } catch (e) {
      console.error("[main] ERROR en módulo agenda:", e);
    }
  }
});