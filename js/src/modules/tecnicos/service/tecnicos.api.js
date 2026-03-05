// modules/tecnicos/service/tecnicos.api.js

import { apiRequest } from "@/core/api/apiRequest.js";

export function fetchTecnicos() {
  return apiRequest("/tecnicos/");
}

export function createTecnico(payload) {
  return apiRequest("/tecnicos/", {
    method: "POST",
    body: payload
  });
}

export function updateTecnico(tecnico, token) {
  const formData = new FormData();
  formData.append("nombre", tecnico.nombre);
  formData.append("apellido", tecnico.apellido);
  formData.append("telefono", tecnico.telefono || "");
  formData.append("email", tecnico.email || "");
  formData.append("duracion_turno_min", tecnico.duracionTurnoMinutos);
  
  // Horarios como JSON string
  formData.append("horarios", JSON.stringify(
    (tecnico.horarios || []).map(h => ({
      dia_semana: h.diaSemana,
      hora_inicio: h.horaInicio,
      hora_fin: h.horaFin
    }))
  ));

  // Imagen si existe
  if (tecnico.imagenFile) {
    formData.append("imagen", tecnico.imagenFile);
  }

  return apiRequest(`/tecnicos/${tecnico.id}`, {
    method: "PUT",
    body: formData,
    token,
    isFormData: true
  });
}

export function deleteTecnico(id) {
  return apiRequest(`/tecnicos/${id}`, {
    method: "DELETE"
  });
}