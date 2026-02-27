import {
  fetchTurnos,
  createTurno,
  updateTurno,
  cancelarTurnoApi
} from "./turnos.api.js";

import {
  mapTurnoFromApi,
  mapTurnoToApi
} from "../mappers/turnos.mapper.js";

/* VALIDACIÓN DOMINIO */
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

/* LISTAR */
export async function obtenerTurnos() {
  const data = await fetchTurnos();

  if (!Array.isArray(data)) return [];

  return data.map(mapTurnoFromApi);
}

/* CREAR */
export async function crearTurno(turno) {
  validarTurno(turno);

  const payload = mapTurnoToApi(turno);
  const created = await createTurno(payload);

  return mapTurnoFromApi(created);
}

/* ACTUALIZAR */
export async function actualizarTurno(turno) {
  validarTurno(turno);

  const payload = mapTurnoToApi(turno);
  const updated = await updateTurno(turno.id, payload);

  return mapTurnoFromApi(updated);
}

/* CANCELAR (no eliminar) */
export async function cancelarTurno(id) {
  const updated = await cancelarTurnoApi(id);
  return mapTurnoFromApi(updated);
}