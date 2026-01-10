import { apiRequest } from "../conexion_backend/api.js";

export class ClienteService {

  static obtenerTodos() {
    return apiRequest("/clientes/");
  }

  static crear(cliente) {
    return apiRequest("/clientes/", {
      method: "POST",
      body: JSON.stringify(cliente)
    });
  }

  static eliminar(id) {
    return apiRequest(`/clientes/${id}`, {
      method: "DELETE"
    });
  }

  static actualizar(id, cliente) {
    return apiRequest(`/clientes/${id}`, {
      method: "PUT",
      body: JSON.stringify(cliente)
    });
  }
}
