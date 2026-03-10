// ============================================================
// turno.model.js — Modelo de dominio del Turno
// ============================================================
// Representa un turno en términos de negocio, desacoplado
// del formato que usa el backend o la UI.
// ============================================================

/**
 * @typedef {Object} TurnoDomain
 * @property {string|number} clienteId
 * @property {string|number} tecnicoId
 * @property {string}        fecha        — "YYYY-MM-DD"
 * @property {string}        horaInicio   — "HH:MM"
 * @property {string}        horaFin      — "HH:MM"
 * @property {number}        tipoTurno    — integer 1-6
 * @property {string}        rangoHorario — "AM" | "PM"
 * @property {string}        estado
 * @property {string}        [numeroTicket]
 * @property {string|number} [id]
 */

export class TurnoModel {
  /**
   * @param {Partial<TurnoDomain>} data
   */
  constructor({
    id           = null,
    clienteId,
    tecnicoId,
    fecha,
    horaInicio,
    horaFin,
    tipoTurno,
    rangoHorario,
    estado       = "Abierto",
    numeroTicket = null,
  } = {}) {
    this.id           = id;
    this.clienteId    = clienteId;
    this.tecnicoId    = tecnicoId;
    this.fecha        = fecha;
    this.horaInicio   = horaInicio;
    this.horaFin      = horaFin;
    this.tipoTurno    = Number(tipoTurno);
    this.rangoHorario = rangoHorario;
    this.estado       = estado;
    this.numeroTicket = numeroTicket;
  }

  /** Genera un número de ticket único basado en clienteId + timestamp */
  static generarTicket(clienteId) {
    return `${clienteId}_${Date.now()}`;
  }

  /** Devuelve la hora de fin calculada a partir de inicio + T bloques */
  static calcularHoraFin(horaInicio, t, duracionBloqueMin = 15) {
    const [h, m] = horaInicio.split(":").map(Number);
    const fecha = new Date();
    fecha.setHours(h, m + t * duracionBloqueMin, 0, 0);
    return fecha.toTimeString().slice(0, 5);
  }
}