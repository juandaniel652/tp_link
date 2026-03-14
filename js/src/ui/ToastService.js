// ============================================================
// ToastService.js — Notificaciones y modales de confirmación
// ============================================================

export class ToastService {

  static container = document.getElementById("toast-container");

  // ----------------------------------------------------------
  // Toasts
  // ----------------------------------------------------------

  static show(message, type = "info", duration = 3000) {
    if (!this.container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    this.container.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 50);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }

  static success(msg) { this.show(msg, "success"); }
  static error(msg)   { this.show(msg, "error");   }
  static info(msg)    { this.show(msg, "info");     }

  // ----------------------------------------------------------
  // Modal de confirmación
  // ----------------------------------------------------------

  /**
   * Muestra un modal de confirmación profesional.
   * @param {Object} options
   * @param {string} options.title       — Título del modal
   * @param {string} options.message     — Mensaje descriptivo
   * @param {string} [options.confirmText="Confirmar"]
   * @param {string} [options.cancelText="Cancelar"]
   * @param {"danger"|"warning"|"info"} [options.type="danger"]
   * @returns {Promise<boolean>} — true si confirmó, false si canceló
   */
  static confirm({
    title       = "¿Estás seguro?",
    message     = "",
    confirmText = "Confirmar",
    cancelText  = "Cancelar",
    type        = "danger",
  } = {}) {
    return new Promise(resolve => {

      // Overlay
      const overlay = document.createElement("div");
      overlay.className = "modal-overlay";

      overlay.innerHTML = `
        <div class="modal-box">
          <div class="modal-icon modal-icon-${type}">
            ${type === "danger"  ? "🗑️" : ""}
            ${type === "warning" ? "⚠️" : ""}
            ${type === "info"    ? "ℹ️" : ""}
          </div>
          <h3 class="modal-title">${title}</h3>
          ${message ? `<p class="modal-message">${message}</p>` : ""}
          <div class="modal-actions">
            <button class="modal-btn modal-btn-cancel">${cancelText}</button>
            <button class="modal-btn modal-btn-confirm modal-btn-${type}">${confirmText}</button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      // Animación entrada
      setTimeout(() => overlay.classList.add("show"), 10);

      const _cerrar = (result) => {
        overlay.classList.remove("show");
        setTimeout(() => overlay.remove(), 300);
        resolve(result);
      };

      overlay.querySelector(".modal-btn-confirm")
        .addEventListener("click", () => _cerrar(true));

      overlay.querySelector(".modal-btn-cancel")
        .addEventListener("click", () => _cerrar(false));

      // Cerrar al clickear el overlay (fuera del box)
      overlay.addEventListener("click", e => {
        if (e.target === overlay) _cerrar(false);
      });

      // Cerrar con Escape
      const _onEsc = e => {
        if (e.key === "Escape") {
          _cerrar(false);
          document.removeEventListener("keydown", _onEsc);
        }
      };
      document.addEventListener("keydown", _onEsc);
    });
  }
}