import { apiRequest } from "../api/apiRequest.js";

export class TecnicoService {

  async obtenerTodos() {
    return apiRequest("/tecnicos");
  }

  async crear(tecnico) {
    return apiRequest("/tecnicos", {
      method: "POST",
      body: JSON.stringify(tecnico)
    });
  }

  async actualizar(id, tecnico) {
    return apiRequest(`/tecnicos/${id}`, {
      method: "PUT",
      body: JSON.stringify(tecnico)
    });
  }

  async eliminar(id) {
    return apiRequest(`/tecnicos/${id}`, {
      method: "DELETE"
    });
  }

}