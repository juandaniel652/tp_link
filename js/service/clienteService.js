import { apiRequest } from "../api/apiRequest.js";

export class ClienteService {

  async obtenerTodos() {
    return apiRequest("/clientes");
  }

  async crear(cliente) {
    return apiRequest("/clientes", {
      method: "POST",
      body: JSON.stringify(cliente)
    });
  }

  async actualizar(id, cliente) {
    return apiRequest(`/clientes/${id}`, {
      method: "PUT",
      body: JSON.stringify(cliente)
    });
  }

  async eliminar(id) {
    return apiRequest(`/clientes/${id}`, {
      method: "DELETE"
    });
  }

}