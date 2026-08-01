// ============================================================
// session.manager.js — Gestión híbrida de sesión
// Comportamiento corporativo:
// - Activo + token por vencer → refresh silencioso
// - Inactivo INACTIVITY_LIMIT → modal de advertencia
// - Sin respuesta en WARNING_COUNTDOWN → logout automático
// ============================================================

import { tokenStorage }  from "../storage/tokenStorage.js";
import { ToastService }  from "../../ui/ToastService.js";

// ----------------------------------------------------------
// Configuración — ajustá estos valores a tu negocio
// ----------------------------------------------------------

const INACTIVITY_LIMIT    = 15 * 60 * 1000; // 15 min sin actividad → advertencia
const WARNING_COUNTDOWN   = 60;              // segundos para responder antes del logout
const REFRESH_BEFORE_EXP  = 2 * 60;         // refrescar token 2 min antes de que venza
// Verificá que esta ruta sea correcta para tu proyecto
const LOGIN_URL = "../html/login.html";  // ← igual que token.guard.js

// ----------------------------------------------------------
// Helpers JWT
// ----------------------------------------------------------

function _decodeExp(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ?? null; // segundos epoch
  } catch {
    return null;
  }
}

function _segundosHastaVencer(token) {
  const exp = _decodeExp(token);
  if (!exp) return 0;
  return exp - Math.floor(Date.now() / 1000);
}

function _tokenVencido(token) {
  return _segundosHastaVencer(token) <= 0;
}

// ----------------------------------------------------------
// SessionManager
// ----------------------------------------------------------

export class SessionManager {

  #inactivityTimer  = null;
  #tokenCheckTimer  = null;
  #warningInterval  = null;
  #warningOverlay   = null;
  #refreshUrl       = null;
  #activityEvents   = ["mousemove", "keydown", "click", "scroll", "touchstart"];

  /**
   * Inicializa el manager.
   * @param {string} refreshUrl — endpoint para refrescar token, ej: "/auth/refresh"
   *                              Pasá null si no tenés refresh endpoint todavía.
   */
  init(refreshUrl = null) {
    this.#refreshUrl = refreshUrl;

    const token = tokenStorage.getToken();
    if (!token || _tokenVencido(token)) {
      this.#logout("Sesión vencida");
      return;
    }

    this.#registrarActividad();
    this.#iniciarCheckToken();
  }

  // ----------------------------------------------------------
  // Actividad del usuario
  // ----------------------------------------------------------

  #registrarActividad() {
    const _onActividad = () => this.#resetInactividad();
    this.#activityEvents.forEach(e =>
      window.addEventListener(e, _onActividad, { passive: true })
    );
    this.#resetInactividad();
  }

  #resetInactividad() {
    clearTimeout(this.#inactivityTimer);
    // Si hay modal de advertencia abierto y el usuario vuelve → cerrarlo
    if (this.#warningOverlay) {
      this.#cerrarWarning();
      ToastService.success("Sesión extendida — seguís conectado");
    }
    this.#inactivityTimer = setTimeout(
      () => this.#mostrarAdvertencia(),
      INACTIVITY_LIMIT
    );
  }

  // ----------------------------------------------------------
  // Check periódico del token
  // ----------------------------------------------------------

  #iniciarCheckToken() {
    // Chequear cada 30 segundos
    this.#tokenCheckTimer = setInterval(() => {
      const token = tokenStorage.getToken();
      if (!token || _tokenVencido(token)) {
        this.#logout("Tu sesión venció");
        return;
      }

      const segs = _segundosHastaVencer(token);

      // Si está activo (no hay warning) y el token está por vencer → refresh
      if (segs <= REFRESH_BEFORE_EXP && !this.#warningOverlay && this.#refreshUrl) {
        this.#refrescarToken();
      }
    }, 30_000);
  }

  // ----------------------------------------------------------
  // Refresh silencioso
  // ----------------------------------------------------------

  async #refrescarToken() {
    try {
      const token = tokenStorage.getToken();
      const res   = await fetch(this.#refreshUrl, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Refresh fallido");
      const data = await res.json();
      tokenStorage.setToken(data.access_token);
    } catch {
      // Si falla el refresh → advertencia
      this.#mostrarAdvertencia();
    }
  }

  // ----------------------------------------------------------
  // Modal de advertencia con countdown
  // ----------------------------------------------------------

  #mostrarAdvertencia() {
    if (this.#warningOverlay) return; // ya está mostrando

    let segundosRestantes = WARNING_COUNTDOWN;

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay show";
    overlay.id        = "sessionWarningOverlay";

    const _html = (segs) => `
      <div class="modal-box">
        <div class="modal-icon modal-icon-warning">⏱️</div>
        <h3 class="modal-title">¿Seguís ahí?</h3>
        <p class="modal-message">
          Tu sesión cerrará por inactividad en
          <strong class="session-countdown">${segs}</strong> segundos.
        </p>
        <div class="modal-actions">
          <button class="modal-btn modal-btn-cancel" id="btnLogoutAhora">
            Cerrar sesión
          </button>
          <button class="modal-btn modal-btn-confirm modal-btn-info" id="btnSeguirConectado">
            Seguir conectado
          </button>
        </div>
      </div>
    `;

    overlay.innerHTML = _html(segundosRestantes);
    document.body.appendChild(overlay);
    this.#warningOverlay = overlay;

    // Countdown
    this.#warningInterval = setInterval(() => {
      segundosRestantes--;
      const el = overlay.querySelector(".session-countdown");
      if (el) el.textContent = segundosRestantes;

      if (segundosRestantes <= 0) {
        this.#logout("Sesión cerrada por inactividad");
      }
    }, 1000);

    // Botón seguir conectado
    overlay.querySelector("#btnSeguirConectado").onclick = () => {
      this.#cerrarWarning();
      this.#resetInactividad();
      ToastService.success("Sesión extendida — seguís conectado");
    };

    // Botón logout manual
    overlay.querySelector("#btnLogoutAhora").onclick = () => {
      this.#logout("Sesión cerrada manualmente");
    };
  }

  #cerrarWarning() {
    clearInterval(this.#warningInterval);
    this.#warningInterval = null;
    this.#warningOverlay?.remove();
    this.#warningOverlay = null;
  }

  // ----------------------------------------------------------
  // Logout
  // ----------------------------------------------------------

  #logout(mensaje = "Sesión finalizada") {
    clearTimeout(this.#inactivityTimer);
    clearInterval(this.#tokenCheckTimer);
    this.#cerrarWarning();

    tokenStorage.removeToken();

    ToastService.info(mensaje);

    // Pequeño delay para que el toast sea visible
    setTimeout(() => {
      window.location.href = LOGIN_URL;
    }, 1500);
  }
}

// Singleton — una sola instancia para toda la app
export const sessionManager = new SessionManager();