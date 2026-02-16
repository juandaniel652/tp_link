// tecnico/TecnicoService.js
import { apiRequest } from "../api/apiRequest.js";

export default class TecnicoService {

  static normalizeHour(hora) {
    if (!hora) return null;
    return hora.length === 5 ? hora + ":00" : hora;
  }

  static toApiPayload(data, isUpdate = false) {
    const payload = {
      nombre: data.nombre,
      apellido: data.apellido,
      telefono: data.telefono || null,
      duracion_turno_min: Number(data.duracion_turno_min),
      email: data.email || null,
      imagen_url: data.imagen_url || "",
      activo: data.activo ?? true
    };

    if (isUpdate && Array.isArray(data.horarios)) {
      payload.horarios = data.horarios.map(h => ({
        dia_semana: Number(h.dia_semana),
        hora_inicio: this.normalizeHour(h.hora_inicio),
        hora_fin: this.normalizeHour(h.hora_fin)
      }));
    }

    return payload;
  }

  static obtenerTodos() {
    return apiRequest("/tecnicos");
  }

  static crear(data) {
    return apiRequest("/tecnicos", {
      method: "POST",
      body: JSON.stringify(this.toApiPayload(data))
    });
  }

  static actualizar(id, data) {
    return apiRequest(`/tecnicos/${id}`, {
      method: "PUT",
      body: JSON.stringify(this.toApiPayload(data, true))
    });
  }

  static eliminar(id) {
    return apiRequest(`/tecnicos/${id}`, { method: "DELETE" });
  }
}
