import { apiRequest } from "../api/apiRequest.js";

export default class TecnicoService {

  static async obtenerTodos() {
    return apiRequest("/tecnicos");
  }

  static async crear(data) {
    return apiRequest("/tecnicos", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }

  static async actualizar(id, data) {
    return apiRequest(`/tecnicos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  }

  static async eliminar(id) {
    return apiRequest(`/tecnicos/${id}`, {
      method: "DELETE"
    });
  }
}
