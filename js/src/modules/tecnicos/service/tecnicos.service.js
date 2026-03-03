import {
  fetchTecnicos,
  createTecnico,
  updateTecnico,
  deleteTecnico
} from "./tecnicos.api.js";

import {
  adaptTecnicoFromApi,
  adaptTecnicoToApi
} from "./mappers/tecnico.mapper.js";

export async function obtenerTecnicos() {
  const data = await fetchTecnicos();
  return data.map(adaptTecnicoFromApi);
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
    formData.append(
      "horarios",
      JSON.stringify(tecnico.horarios.map(adaptDisponibilidadToApi))
    );

    const created = await createTecnico(formData, token, true);
    return adaptTecnicoFromApi(created);
  }

  const payload = adaptTecnicoToApi(tecnico);
  const created = await createTecnico(payload, token);
  return adaptTecnicoFromApi(created);
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