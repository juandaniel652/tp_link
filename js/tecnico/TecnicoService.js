import { apiRequest } from "../api/apiRequest.js";

export default class TecnicoService {

  static normalizeHour(hora) {
    if (!hora) return null;
    return hora.length === 5 ? hora + ":00" : hora;
  }

  static toApiPayload(data, isUpdate = false) {
    if (!data.nombre || !data.apellido) {
      throw new Error("Nombre y apellido son obligatorios");
    }

    if (!data.duracion_turno_min || isNaN(data.duracion_turno_min)) {
      throw new Error("Duración de turno inválida");
    }

    const payload = {
      nombre: data.nombre.trim(),
      apellido: data.apellido.trim(),
      telefono: data.telefono || null,
      duracion_turno_min: Number(data.duracion_turno_min),
      email: data.email || null,
      imagen_url: data.imagen_url || ""
    };

    if (isUpdate && Array.isArray(data.horarios)) {
      payload.horarios = data.horarios; 
    }

    return payload;
  }

  static async obtenerTodos() {
    return apiRequest("/tecnicos");
  }

  static async crear(data) {
    const payload = this.toApiPayload(data, true);
    return apiRequest("/tecnicos", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  static async actualizar(id, data) {
    const payload = this.toApiPayload(data, true);
    console.log("API PAYLOAD UPDATE REAL", payload);
    return apiRequest(`/tecnicos/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  }


  static async eliminar(id) {
    return apiRequest(`/tecnicos/${id}`, {
      method: "DELETE"
    });
  }
}
