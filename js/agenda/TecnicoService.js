import { apiRequest } from "../api/apiRequest.js";

export class TecnicoService {
  static obtenerTodos() {
    return apiRequest("/tecnicos"); // GET
  }

  static crear(tecnico) {
    return apiRequest("/tecnicos", {
      method: "POST",
      body: JSON.stringify(tecnico)
    });
  }

  static actualizar(id, tecnico) {
    return apiRequest(`/tecnicos/${id}`, {
      method: "PUT",
      body: JSON.stringify(tecnico)
    });
  }

  static eliminar(id) {
    return apiRequest(`/tecnicos/${id}`, { method: "DELETE" });
  }
}
