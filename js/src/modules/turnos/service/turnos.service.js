import {
  fetchTurnosPorFecha,
  createTurno as createTurnoApi,
  updateTurno as updateTurnoApi,
  cancelarTurno as cancelarTurnoApi
} from "./turnos.api.js";

import {
  mapTurnoFromApi,
  mapTurnoToApi
} from "../mappers/turnos.mapper.js";

function validarTurno(turno) {
  if (!turno.cliente?.id) {
    throw new Error("Cliente inválido");
  }

  if (!turno.tecnico?.id) {
    throw new Error("Técnico inválido");
  }

  if (turno.horaInicio >= turno.horaFin) {
    throw new Error("Horario inválido");
  }
}

export async function obtenerTurnosPorFecha(fecha) {
  const data = await fetchTurnosPorFecha(fecha);

  if (!Array.isArray(data)) return [];

  return data.map(mapTurnoFromApi);
}

export async function crearTurno(turno) {
  validarTurno(turno);

  const payload = mapTurnoToApi(turno);
  const created = await createTurnoApi(payload);

  return mapTurnoFromApi(created);
}

export async function actualizarTurno(turno) {
  validarTurno(turno);

  const payload = mapTurnoToApi(turno);
  const updated = await updateTurnoApi(turno.id, payload);

  return mapTurnoFromApi(updated);
}

export async function cancelarTurno(id) {
  const updated = await cancelarTurnoApi(id);
  return mapTurnoFromApi(updated);
}