// ============================================================
// index.js — Barrel export del módulo Turnos
// ============================================================
// Importa desde aquí para acceder al módulo desde afuera.
// ============================================================

// Entry point — llamado desde main.js
export { initTurnos }               from "./controller/turnos.controller.js";

// Modelo
export { TurnoModel }               from "./model/turno.model.js";

// Mapper
export { TurnosMapper }             from "./mappers/turnos.mapper.js";

// Servicios
export {
  cargarTurnos,
  cargarTurnosPorFecha,
  guardarTurno,
  cancelarTurnoById,
  validarNuevoTurno,
}                                   from "./service/turnos.service.js";

export {
  hayConflicto,
  clienteYaTieneTurno,
  filtrarClientesDisponibles,
  filtrarPorRango,
  obtenerHorariosDisponibles,
  obtenerFechasDisponibles,
}                                   from "./service/disponibilidad.service.js";

export { resolverCliente }          from "./service/andros.service.js";

export {
  getTurnos,
  getTurnosPorFecha,
  crearTurno,
  cancelarTurno,
  eliminarTurno,
}                                   from "./service/turnos.api.js";

// Constantes
export * from "./service/turnos.constants.js";

// Errores
export * from "./service/errors.js";

// Estado UI
export {
  UI_STATE,
  cambiarEstado,
  getEstadoActual,
  onEstadoCambia,
  resetEstado,
}                                   from "./state/turnos.state.js";

// Vistas
export {
  renderHistorialTurnos,
  agregarTurnoAlHistorial,
  inicializarSelectorFecha,
  formatearFecha,
  formatearHora,
  formatearEstado,
  formatearTipo,
  formatearTicket,
}                                   from "./view/turnos.historial.view.js";

export {
  renderGrillaTurnos,
  renderSelectClientes,
  renderSelectTecnicos,
  renderSelectGen,
  limpiarSelects,
  formatearRango,
}                                   from "./view/turnos.view.js";