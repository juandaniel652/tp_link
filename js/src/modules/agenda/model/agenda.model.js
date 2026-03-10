/**
 * @typedef {Object} TurnoAgenda
 * @property {number} id
 * @property {string} numero_ticket
 * @property {string} fecha              - YYYY-MM-DD
 * @property {string} hora_inicio        - HH:MM
 * @property {string} hora_fin           - HH:MM
 * @property {Object|null} cliente
 * @property {Object|null} tecnico
 * @property {string} estado
 * @property {string} color              - color hex según estado
 */

export class TurnoAgenda {
  constructor({
    id,
    numero_ticket,
    fecha,
    hora_inicio,
    hora_fin,
    cliente = null,
    tecnico = null,
    estado = 'pendiente',
    color = '#7f8c8d'
  } = {}) {
    this.id            = id;
    this.numero_ticket = numero_ticket;
    this.fecha         = fecha;
    this.hora_inicio   = hora_inicio;
    this.hora_fin      = hora_fin;
    this.cliente       = cliente;
    this.tecnico       = tecnico;
    this.estado        = estado;
    this.color         = color;
  }
}