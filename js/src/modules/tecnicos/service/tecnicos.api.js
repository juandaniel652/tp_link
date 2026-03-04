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

export function updateTecnico(id, payload) {
  return apiRequest(`/tecnicos/${id}`, {
    method: "PUT",
    body: payload
  });
}

export function deleteTecnico(id) {
  return apiRequest(`/tecnicos/${id}`, {
    method: "DELETE"
  });
}