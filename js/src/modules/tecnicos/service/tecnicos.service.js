import {
  fetchTecnicos,
  createTecnico,
  updateTecnico,
  deleteTecnico
} from "./tecnicos.api.js";

import {
  adaptTecnicoFromApi,
  adaptTecnicoToApi
} from "../mappers/tecnicos.mapper.js";

export async function obtenerTecnicos() {
  const data = await fetchTecnicos();
  return data.map(adaptTecnicoFromApi);
}

export async function crearTecnico(tecnico) {
  if (tecnico.imagen instanceof File) {
    const formData = new FormData();
    formData.append("nombre", tecnico.nombre);
    formData.append("apellido", tecnico.apellido);
    formData.append("telefono", tecnico.telefono);
    formData.append("duracion_turno_min", tecnico.duracionTurnoMinutos);
    formData.append("email", tecnico.email);
    formData.append("activo", tecnico.activo);
    formData.append("imagen", tecnico.imagen);
    formData.append(
      "horarios",
      JSON.stringify(tecnico.horarios.map(mapDisponibilidadToApi))
    );

    const created = await createTecnico(formData);
    return mapTecnicoFromApi(created);
  }

  const payload = mapTecnicoToApi(tecnico);
  const created = await createTecnico(JSON.stringify(payload));
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
    formData.append(
      "horarios",
      JSON.stringify(tecnico.horarios.map(adaptDisponibilidadToApi))
    );

    const updated = await updateTecnico(tecnico.id, formData, token, true);
    return adaptTecnicoFromApi(updated);
  }

  const payload = adaptTecnicoToApi(tecnico);
  const updated = await updateTecnico(tecnico.id, payload, token);
  return adaptTecnicoFromApi(updated);
}

export async function eliminarTecnico(id, token) {
  return deleteTecnico(id, token);
}