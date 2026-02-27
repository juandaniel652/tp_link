import {
  fetchTecnicos,
  createTecnico,
  updateTecnico,
  deleteTecnico
} from "./tecnicos.api.js";

import {
  mapTecnicoFromApi,
  mapTecnicoToApi
} from "../mappers/tecnico.mapper.js";

export async function obtenerTecnicos(token) {
  const data = await fetchTecnicos(token);
  return data.map(mapTecnicoFromApi);
}

export async function crearTecnico(tecnico, token) {

  if (tecnico.imagen instanceof File) {
    const formData = new FormData();
    formData.append("nombre", tecnico.nombre);
    formData.append("apellido", tecnico.apellido);
    formData.append("telefono", tecnico.telefono);
    formData.append("duracion_turno_min", tecnico.duracionTurnoMinutos);
    formData.append("email", tecnico.email);
    formData.append("activo", tecnico.activo);
    formData.append("imagen", tecnico.imagen);
    formData.append("horarios", JSON.stringify(tecnico.horarios));

    const created = await createTecnico(formData, token, true);
    return mapTecnicoFromApi(created);
  }

  const payload = mapTecnicoToApi(tecnico);
  const created = await createTecnico(payload, token);
  return mapTecnicoFromApi(created);
}

export async function actualizarTecnico(tecnico, token) {

  if (tecnico.imagen instanceof File) {
    const formData = new FormData();
    formData.append("nombre", tecnico.nombre);
    formData.append("apellido", tecnico.apellido);
    formData.append("telefono", tecnico.telefono);
    formData.append("duracion_turno_min", tecnico.duracionTurnoMinutos);
    formData.append("email", tecnico.email);
    formData.append("activo", tecnico.activo);
    formData.append("imagen", tecnico.imagen);
    formData.append("horarios", JSON.stringify(tecnico.horarios));

    const updated = await updateTecnico(tecnico.id, formData, token, true);
    return mapTecnicoFromApi(updated);
  }

  const payload = mapTecnicoToApi(tecnico);
  const updated = await updateTecnico(tecnico.id, payload, token);
  return mapTecnicoFromApi(updated);
}

export async function eliminarTecnico(id, token) {
  return deleteTecnico(id, token);
}