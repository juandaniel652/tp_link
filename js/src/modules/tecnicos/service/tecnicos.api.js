// modules/tecnicos/service/tecnicos.api.js

import { apiRequest } from "@/core/api/apiRequest.js";
import { adaptTecnicoToApi } from "../mappers/tecnicos.mapper.js";

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

  // Convertir a formato API
  const tecnicoApi = adaptTecnicoToApi(tecnico);

  // Campos simples
  formData.append("nombre", tecnicoApi.nombre || "");
  formData.append("apellido", tecnicoApi.apellido || "");
  formData.append("telefono", tecnicoApi.telefono || "");
  formData.append("email", tecnicoApi.email || "");
  formData.append("duracion_turno_min", tecnicoApi.duracion_turno_min ?? 0);

  // Horarios como JSON string
  formData.append(
    "horarios",
    JSON.stringify(
      (tecnicoApi.horarios || []).filter(
        h => h.dia_semana && h.hora_inicio && h.hora_fin
      )
    )
  );

  // Imagen si existe
  if (tecnico.imagenFile) {
    formData.append("imagen", tecnico.imagenFile);
  }

  // Debug
  console.log("FormData a enviar:");
  for (let pair of formData.entries()) {
    console.log(pair[0], pair[1]);
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