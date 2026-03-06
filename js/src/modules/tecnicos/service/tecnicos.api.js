// modules/tecnicos/service/tecnicos.api.js

import { apiRequest } from "@/core/api/apiRequest.js";
import { adaptTecnicoToApi } from "../mappers/tecnicos.mapper.js";

// Listar técnicos
export function obtenerTecnicos(token) {
  return apiRequest("/tecnicos/", { token });
}

// Crear técnico
export function crearTecnico(payload) {
  return apiRequest("/tecnicos/", {
    method: "POST",
    body: payload
  });
}

// Actualizar técnico
export function updateTecnico(tecnico, token) {
  const formData = new FormData();
  const tecnicoApi = adaptTecnicoToApi(tecnico);

  formData.append("nombre", tecnicoApi.nombre || "");
  formData.append("apellido", tecnicoApi.apellido || "");
  formData.append("telefono", tecnicoApi.telefono || "");
  formData.append("email", tecnicoApi.email || "");
  formData.append("duracion_turno_min", tecnicoApi.duracion_turno_min ?? 0);
  formData.append(
    "horarios",
    JSON.stringify(
      (tecnicoApi.horarios || []).filter(
        h => h.dia_semana && h.hora_inicio && h.hora_fin
      )
    )
  );

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

// Eliminar técnico
export function eliminarTecnico(id) {
  return apiRequest(`/tecnicos/${id}`, {
    method: "DELETE"
  });
}