// ============================================================
// turnos.service.js — Servicio de negocio del módulo Turnos
// ============================================================
// Orquesta: validaciones de dominio + llamadas a la API +
// construcción del payload final.
// ============================================================

import { TurnoModel }        from "../model/turno.model.js";
import { TurnosMapper }      from "../mappers/turnos.mapper.js";
import { crearTurno, getTurnos, getTurnosPorFecha, cancelarTurno }
                             from "./turnos.api.js";
import { hayConflicto }      from "./disponibilidad.service.js";
import {
  ConflictoHorarioError,
  CamposFaltantesError,
  TecnicoNoEncontradoError,
} from "./errors.js";

// ----------------------------------------------------------
// Helpers
// ----------------------------------------------------------

function validarCampos(turnoUI) {
  const requeridos = [
    "cliente_id", "tecnico_id", "fecha",
    "hora_inicio", "hora_fin", "tipo_turno", "rango_horario",
  ];
  const faltantes = requeridos.filter(k => !turnoUI[k] && turnoUI[k] !== 0);
  if (faltantes.length) throw new CamposFaltantesError(faltantes);
}

// ----------------------------------------------------------
// API pública del servicio
// ----------------------------------------------------------

/**
 * Carga todos los turnos desde el backend y los devuelve
 * como ViewModels listos para la UI.
 * @returns {Promise<Object[]>}
 */
export async function cargarTurnos() {
  const raw = await getTurnos();
  return TurnosMapper.backendListToViewModels(raw);
}

/**
 * Carga turnos filtrados por fecha.
 * @param {string} fecha — "YYYY-MM-DD"
 * @returns {Promise<Object[]>} ViewModels
 */
export async function cargarTurnosPorFecha(fecha) {
  const raw = await getTurnosPorFecha(fecha);
  return TurnosMapper.backendListToViewModels(raw);
}

/**
 * Valida y persiste un nuevo turno.
 *
 * 1. Valida campos obligatorios.
 * 2. Valida conflictos de dominio contra los turnos existentes.
 * 3. Envía al backend.
 * 4. Devuelve el ViewModel del turno creado.
 *
 * @param {Object}   turnoUI     — objeto plano proveniente de grilla/controller
 * @param {Object[]} turnosActuales — lista actual de ViewModels (para validar conflictos)
 * @param {Object}   tecnico     — instancia Tecnico
 * @returns {Promise<Object>} ViewModel del turno creado
 * @throws {CamposFaltantesError | ConflictoHorarioError}
 */
export async function guardarTurno(turnoUI, turnosActuales, tecnico) {
  // 1. Campos obligatorios
  validarCampos(turnoUI);

  // 2. Conflicto de horario (dominio)
  const nombreTecnico = tecnico
    ? `${tecnico.nombre} ${tecnico.apellido}`
    : turnoUI.tecnico_nombre ?? "";

  const conflicto = hayConflicto(
    turnosActuales,
    turnoUI.fecha,
    turnoUI.hora_inicio,
    nombreTecnico,
    turnoUI.cliente_id,
    turnoUI.tipo_turno
  );

  if (conflicto) {
    throw new ConflictoHorarioError(
      `Horario ocupado: ${turnoUI.hora_inicio} el ${turnoUI.fecha}`
    );
  }

  // 3. Construir dominio → payload
  const domain = new TurnoModel({
    clienteId:    turnoUI.cliente_id,
    tecnicoId:    turnoUI.tecnico_id,
    fecha:        turnoUI.fecha,
    horaInicio:   turnoUI.hora_inicio,
    horaFin:      turnoUI.hora_fin,
    tipoTurno:    turnoUI.tipo_turno,
    rangoHorario: turnoUI.rango_horario,
    estado:       turnoUI.estado ?? "Abierto",
    numeroTicket: turnoUI.numero_ticket ?? TurnoModel.generarTicket(turnoUI.cliente_id),
  });

  const payload = TurnosMapper.domainToBackendPayload(domain);

  // 4. Persistir
  const raw = await crearTurno(payload);

  // 5. Devolver ViewModel
  return TurnosMapper.backendToViewModel(raw);
}

/**
 * Cancela un turno y devuelve true si fue exitoso.
 * @param {string|number} id
 * @returns {Promise<boolean>}
 */
export async function cancelarTurnoById(id) {
  return cancelarTurno(id);
}

/**
 * Valida en memoria si un nuevo turno de dominio colisiona
 * con los existentes (usado por tests y validación pre-envío).
 *
 * @param {TurnoModel[]} turnosDominio
 * @param {TurnoModel}   nuevoDominio
 * @throws {ConflictoHorarioError}
 */
export function validarNuevoTurno(turnosDominio, nuevoDominio) {
  // Reutilizamos hayConflicto mapeando el dominio a un shape compatible
  const turnos = turnosDominio.map(t => ({
    fecha:       t.fecha,
    horaInicio:  t.horaInicio,
    horaFin:     t.horaFin,
    clienteId:   t.clienteId,
    tecnicoId:   t.tecnicoId,
    // ViewModel shape requerida por hayConflicto
    tecnicoNombre:   "",   // sin nombre disponible en dominio puro
    tecnicoApellido: "",
  }));

  // Detectamos conflicto por clienteId (sin nombre de técnico)
  const conflicto = turnosDominio.some(t => {
    if (t.fecha !== nuevoDominio.fecha) return false;
    if (String(t.clienteId) === String(nuevoDominio.clienteId)) {
      // Mismo cliente, mismo día → conflicto
      return true;
    }
    if (String(t.tecnicoId) === String(nuevoDominio.tecnicoId)) {
      // Mismo técnico → revisar intersección horaria
      const existente = generarBloquesDominio(t);
      const candidato = generarBloquesDominio(nuevoDominio);
      return candidato.some(b => existente.includes(b));
    }
    return false;
  });

  if (conflicto) throw new ConflictoHorarioError();
}

// Helper local para validarNuevoTurno
function generarBloquesDominio(turno) {
  const bloques = [];
  let actual = turno.horaInicio;
  const fin  = turno.horaFin;
  while (actual < fin) {
    bloques.push(actual);
    const [h, m] = actual.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m + 15, 0, 0);
    actual = d.toTimeString().slice(0, 5);
  }
  return bloques;
}