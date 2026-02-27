import { apiRequest } from "../../../core/api/apiRequest.js";

const BASE = "/turnos";

export function fetchTurnosPorFecha(fecha) {
  return apiRequest(`${BASE}?fecha=${fecha}`);
}

export function createTurno(data) {
  return apiRequest(BASE, {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export function cancelarTurno(id) {
  return apiRequest(`${BASE}/${id}/cancelar`, {
    method: "PATCH"
  });
}

export function updateTurno(id, data) {
  return apiRequest(`${BASE}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

export function deleteTurno(id) {
  return apiRequest(`${BASE}/${id}`, {
    method: "DELETE"
  });
}