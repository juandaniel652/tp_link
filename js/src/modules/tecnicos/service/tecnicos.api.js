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

  // Campos obligatorios
  formData.append("nombre", tecnico.nombre || "");
  formData.append("apellido", tecnico.apellido || "");
  formData.append("telefono", tecnico.telefono || "");
  formData.append("email", tecnico.email || "");
  formData.append("duracion_turno_min", tecnico.duracionTurnoMinutos ?? 0);

  // Filtramos horarios inválidos
  const horariosValidos = (tecnico.horarios || []).filter(
    h => h.diaSemana && h.horaInicio && h.horaFin
  );

  formData.append(
    "horarios",
    JSON.stringify(
      horariosValidos.map(h => ({
        dia_semana: h.diaSemana,
        hora_inicio: h.horaInicio,
        hora_fin: h.horaFin
      }))
    )
  );

  // Imagen si existe
  if (tecnico.imagenFile) {
    formData.append("imagen", tecnico.imagenFile);
  }

  // Debug: revisar FormData antes de enviar
  console.log("FormData a enviar:");
  for (let pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }

  return apiRequest(`/tecnicos/${tecnico.id}`, {
    method: "PUT",
    body: formData,
    token,
    isFormData: true // asegurarse que apiRequest NO ponga Content-Type manualmente
  });
}

export function deleteTecnico(id) {
  return apiRequest(`/tecnicos/${id}`, {
    method: "DELETE"
  });
}