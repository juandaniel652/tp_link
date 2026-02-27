import { apiRequest } from "@/core/api/apiRequest.js";

export async function obtenerDisponibilidad({ tecnicoId, fecha, token }) {
  return apiRequest(
    `/disponibilidad?tecnico_id=${tecnicoId}&fecha=${fecha}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
}