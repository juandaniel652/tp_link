// js/src/app/main.js
import { requireAuth }    from "../core/auth/token.guard.js";
import { sessionManager } from "../core/auth/session.manager.js";
import { tokenStorage }   from "../core/storage/tokenStorage.js";
import { ToastService }   from "../ui/ToastService.js";

function getPayloadFromToken() {
  try {
    const token = tokenStorage.getToken();
  return JSON.parse(decodeURIComponent(escape(atob(token.split(".")[1]))));
  } catch { return null; }
}

  document.addEventListener("DOMContentLoaded", async () => {
  const path = window.location.pathname;
  const isAuthPage = path.includes("login.html") || path.includes("register.html") || path.includes("recuperacion.html");

  // 1. MANEJO DE PÁGINAS DE ACCESO (Login, Register, etc.)
  if (isAuthPage) {
    console.log("[main] Página de acceso detectada — activando controlador...");
    if (path.includes("login.html")) {
      try {
        // Importamos dinámicamente el módulo de auth y ejecutamos initLogin
        const { initLogin } = await import("../modules/auth/index.js");
        initLogin();
      } catch (e) {
        console.error("[main] Error cargando initLogin:", e);
      }
    }
    return; // Salimos para no ejecutar validación de token aquí
  }

  // 2. MANEJO DE PÁGINAS PROTEGIDAS (Index, Clientes, etc.)
  console.log("[main] Página protegida — validando sesión");
  if (!requireAuth()) {
    console.warn("[main] requireAuth falló — redirigiendo");
    return;
  }

  console.log("[main] Auth OK");
  sessionManager.init(null);

  const payload = getPayloadFromToken();
  const role    = payload?.role ?? null;
  console.log("[main] Rol detectado:", role);

  // --- NUEVO: Marcamos el body globalmente ---
  if (role === "admin") {
    document.body.classList.add("is-admin");
    document.body.classList.remove("user-readonly");
  } else {
    document.body.classList.add("user-readonly");
    document.body.classList.remove("is-admin");
  }

  // Toast de bienvenida — solo una vez por sesión
  if (!sessionStorage.getItem("welcomed")) {
    const nombre = payload?.email?.split("@")[0] ?? "Usuario";
    ToastService.success(`¡Bienvenido, ${nombre}!`);
    sessionStorage.setItem("welcomed", "1");
  }

  // ── Turnos ────────────────────────────────────────────────
  if (document.querySelector("#turnosContainer")) {
    console.log("[main] Página de turnos detectada — cargando módulo...");
    try {
      const { initTurnos } = await import("../modules/turnos/index.js");
      console.log("[main] initTurnos importado OK");
      await initTurnos();
      console.log("[main] initTurnos ejecutado OK");
    } catch (e) {
      console.error("[main] ERROR en módulo turnos:", e);
    }
  }

  // ── Clientes ──────────────────────────────────────────────
  if (document.querySelector("#clientesTable")) { 
    console.log("[main] Página de clientes detectada — cargando módulo...");
    try {
      const { initClientes } = await import("../modules/clientes/index.js");
      await initClientes();
      
      // Tip: Agregamos la clase al body aquí para el CSS
      if (role === "admin") {
        document.body.classList.add("is-admin");
      }
    } catch (e) {
      console.error("[main] ERROR en módulo clientes:", e);
    }
  }

  // ── Técnicos ──────────────────────────────────────────────
  if (document.querySelector("#tecnicosTable") || document.querySelector("#formGeneral")) {
    try {
      const { initTecnicos } = await import("../modules/tecnicos/index.js");
      await initTecnicos();
    } catch (e) { console.error(e); }
  }

  // ── Agenda ────────────────────────────────────────────────
  if (role === "admin" && document.querySelector("#agendaContainer")) {
    console.log("[main] Página de agenda detectada — cargando módulo...");
    try {
      const { initAgenda } = await import("../modules/agenda/index.js");
      await initAgenda();
    } catch (e) {
      console.error("[main] ERROR en módulo agenda:", e);
    }
  }
});