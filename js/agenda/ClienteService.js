import { API_BASE_URL } from "../agenda/utils.js";

const ENDPOINT = `${API_BASE_URL}/clientes`;

export class ClienteService {

  async getAll() {
    const response = await fetch(ENDPOINT);

    if (!response.ok) {
      throw new Error("Error al obtener clientes");
    }

    return response.json();
  }

  async create(cliente) {
    const payload = {
      numero_cliente: cliente.numeroCliente,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      telefono: cliente.telefono,
      domicilio: cliente.domicilio,
      numero_domicilio: cliente.numeroDomicilio,
      email: cliente.email
    };
  
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Error al crear cliente");
    }
  
    return response.json();
  }

}
