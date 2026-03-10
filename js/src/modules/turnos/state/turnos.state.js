// ============================================================
// turnos.state.js — Estado de UI del módulo Turnos
// ============================================================
// Migrado desde uiState.js con soporte para múltiples
// suscriptores y reset limpio de estado.
// ============================================================

// ----------------------------------------------------------
// Constantes de estado
// ----------------------------------------------------------

export const UI_STATE = Object.freeze({
  DISPONIBILIDAD: "disponibilidad",
  HISTORIAL:      "historial",
});

// ----------------------------------------------------------
// Estado interno
// ----------------------------------------------------------

let _currentState = null;

/** @type {Map<string, Function[]>} */
const _listeners = new Map();

// ----------------------------------------------------------
// API pública
// ----------------------------------------------------------

/**
 * Devuelve el estado actual de la UI.
 * @returns {string|null}
 */
export function getEstadoActual() {
  return _currentState;
}

/**
 * Cambia el estado de la UI y aplica los efectos visuales
 * sobre los elementos del DOM recibidos en `refs`.
 *
 * @param {string} nuevoEstado — valor de UI_STATE
 * @param {{
 *   turnosContainer:    HTMLElement,
 *   historialContainer: HTMLElement,
 *   selectorFecha:      HTMLElement,
 *   titulo:             HTMLElement
 * }} refs
 */
export function cambiarEstado(nuevoEstado, refs) {
  if (_currentState === nuevoEstado) return;

  _currentState = nuevoEstado;

  const {
    turnosContainer,
    historialContainer,
    selectorFecha,
    titulo,
  } = refs;

  // Limpiar siempre ambos contenedores
  turnosContainer.innerHTML   = "";
  historialContainer.innerHTML = "";

  switch (nuevoEstado) {

    case UI_STATE.DISPONIBILIDAD:
      turnosContainer.style.display    = "grid";
      historialContainer.style.display = "none";
      selectorFecha.style.display      = "none";
      titulo.textContent               = "Turnos Disponibles";
      break;

    case UI_STATE.HISTORIAL:
      turnosContainer.style.display    = "none";
      historialContainer.style.display = "block";
      selectorFecha.style.display      = "block";
      titulo.textContent               = "Historial de Turnos";
      break;

    default:
      console.warn(`[turnos.state] Estado desconocido: ${nuevoEstado}`);
  }

  // Notificar suscriptores
  _notificar(nuevoEstado);
}

/**
 * Suscribe una función callback que se ejecuta al cambiar de estado.
 * @param {string}   estado — UI_STATE a escuchar (o "*" para todos)
 * @param {Function} fn
 * @returns {Function} unsuscribe — llámalo para eliminar la suscripción
 */
export function onEstadoCambia(estado, fn) {
  if (!_listeners.has(estado)) _listeners.set(estado, []);
  _listeners.get(estado).push(fn);

  return () => {
    const arr = _listeners.get(estado) ?? [];
    const idx = arr.indexOf(fn);
    if (idx !== -1) arr.splice(idx, 1);
  };
}

/**
 * Resetea el estado interno (útil en tests).
 */
export function resetEstado() {
  _currentState = null;
  _listeners.clear();
}

// ----------------------------------------------------------
// Helpers
// ----------------------------------------------------------

function _notificar(estado) {
  (_listeners.get(estado) ?? []).forEach(fn => fn(estado));
  (_listeners.get("*")    ?? []).forEach(fn => fn(estado));
}