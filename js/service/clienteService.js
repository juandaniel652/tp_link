import { apiRequest } from "../api/apiRequest.js";

export class ClienteService {
  static obtenerTodos() {
    return apiRequest("/clientes");
  }

  static crear(cliente) {
    return apiRequest("/clientes", {
      method: "POST",
      body: JSON.stringify(cliente)
    });
  }

  static actualizar(id, cliente) {
    return apiRequest(`/clientes/${id}`, {
      method: "PUT",
      body: JSON.stringify(cliente)
    });
  }

  static eliminar(id) {
    return apiRequest(`/clientes/${id}`, { method: "DELETE" });
  }
}
