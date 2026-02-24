import { apiRequest } from "../api/apiRequest.js";

export class ClienteService {

  async obtenerTodos() {
    return apiRequest("/clientes");
  }

  async crear(cliente) {
    return apiRequest("/clientes", {
      method: "POST",
  
    });
  }

  async actualizar(id, cliente) {
    return apiRequest(`/clientes/${id}`, {
      method: "PUT",
      
    });
  }

  async eliminar(id) {
    return apiRequest(`/clientes/${id}`, {
      method: "DELETE"
    });
  }

}