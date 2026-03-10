// ============================================================
// errors.js — Errores de dominio del módulo Turnos
// ============================================================

export class TurnoError extends Error {
  constructor(message) {
    super(message);
    this.name = "TurnoError";
  }
}

export class ConflictoHorarioError extends TurnoError {
  constructor(detalle = "Conflicto de horario detectado") {
    super(detalle);
    this.name = "ConflictoHorarioError";
  }
}

export class ClienteSinDatosError extends TurnoError {
  constructor(clienteId) {
    super(`No se encontró el cliente con ID: ${clienteId}`);
    this.name = "ClienteSinDatosError";
  }
}

export class TecnicoNoEncontradoError extends TurnoError {
  constructor(tecnicoId) {
    super(`No se encontró el técnico con ID: ${tecnicoId}`);
    this.name = "TecnicoNoEncontradoError";
  }
}

export class CamposFaltantesError extends TurnoError {
  constructor(campos = []) {
    super(`Faltan campos obligatorios: ${campos.join(", ")}`);
    this.name = "CamposFaltantesError";
  }
}

export class SinFechasDisponiblesError extends TurnoError {
  constructor() {
    super("No hay fechas disponibles para el técnico en los próximos 30 días");
    this.name = "SinFechasDisponiblesError";
  }
}