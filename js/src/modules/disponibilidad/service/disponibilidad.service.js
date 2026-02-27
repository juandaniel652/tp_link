import {
  fetchDisponibilidad,
  createDisponibilidad,
  updateDisponibilidad,
  deleteDisponibilidad
} from "./disponibilidad.api.js";

import {
  mapDisponibilidadFromApi,
  mapDisponibilidadToApi
} from "../mappers/disponibilidad.mapper.js";

export async function obtenerDisponibilidad(tecnicoId, token) {
  const data = await fetchDisponibilidad(tecnicoId, token);
  return data.map(mapDisponibilidadFromApi);
}

export async function crearDisponibilidad(entity, token) {
  const payload = mapDisponibilidadToApi(entity);
  const created = await createDisponibilidad(entity.tecnicoId, payload, token);
  return mapDisponibilidadFromApi(created);
}

export async function actualizarDisponibilidad(entity, token) {
  const payload = mapDisponibilidadToApi(entity);
  const updated = await updateDisponibilidad(entity.id, payload, token);
  return mapDisponibilidadFromApi(updated);
}

export async function eliminarDisponibilidad(id, token) {
  return deleteDisponibilidad(id, token);
}