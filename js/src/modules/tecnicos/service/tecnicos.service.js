// js/src/modules/tecnicos/service/tecnicos.service.js
import {
  fetchTecnicos,
  createTecnico,
  updateTecnico,
  deleteTecnico
} from "./tecnicos.api.js";

import {
  adaptTecnicoFromApi,
  adaptTecnicoToApi,
  adaptDisponibilidadToApi
} from "../mappers/tecnicos.mapper.js";

export async function obtenerTecnicos(token) {
  const data = await fetchTecnicos(token); // PASAR TOKEN
  return data.map(adaptTecnicoFromApi);
}

export async function crearTecnico(tecnico, token) {

  let created;

  if (tecnico.imagenFile instanceof File) {
    const formData = new FormData();
    formData.append("nombre", tecnico.nombre);
    formData.append("apellido", tecnico.apellido);
    formData.append("telefono", tecnico.telefono);
    formData.append("duracion_turno_min", tecnico.duracionTurnoMinutos);
    formData.append("email", tecnico.email);
    formData.append("activo", tecnico.activo);
    formData.append("imagen", tecnico.imagenFile);
    formData.append(
      "horarios",
      JSON.stringify((tecnico.horarios || []).map(adaptDisponibilidadToApi))
    );

    created = await createTecnico(formData, token, true);

  } else {
    const payload = adaptTecnicoToApi(tecnico);
    created = await createTecnico(JSON.stringify(payload), token);
  }

  return adaptTecnicoFromApi(created);
}

export async function actualizarTecnico(tecnico, token) {

  let updated;

  if (tecnico.imagenFile instanceof File) {
    const formData = new FormData();
    formData.append("nombre", tecnico.nombre);
    formData.append("apellido", tecnico.apellido);
    formData.append("telefono", tecnico.telefono);
    formData.append("duracion_turno_min", tecnico.duracionTurnoMinutos);
    formData.append("email", tecnico.email);
    formData.append("activo", tecnico.activo);
    formData.append("imagen", tecnico.imagenFile);
    formData.append(
      "horarios",
      JSON.stringify((tecnico.horarios || []).map(adaptDisponibilidadToApi))
    );

    updated = await updateTecnico(tecnico.id, formData, token, true);

  } else {
    const payload = adaptTecnicoToApi(tecnico);
    updated = await updateTecnico(tecnico.id, payload, token);
  }

  return adaptTecnicoFromApi(updated);
}

export async function eliminarTecnico(id, token) {
  return deleteTecnico(id, token);
}