import { apiRequest } from "../api/apiRequest.js";

export default class TecnicoService {

  // =========================
  // ADAPTER FRONT -> BACK
  // =========================
  static toApiPayload(tecnico) {
    return {
      nombre: tecnico.nombre,
      apellido: tecnico.apellido,
      telefono: tecnico.telefono,
      duracion_turno_minutos: tecnico.duracionTurnoMinutos,
      email: tecnico.email,
      imagen: tecnico.imagen,
      horarios: tecnico.horarios.map(h => ({
        dia_semana: Number(h.dia),
        hora_inicio: h.inicio + ":00",
        hora_fin: h.fin + ":00"
      }))
    };
  }

  // =========================
  // CRUD
  // =========================
  static async obtenerTodos() {
    return apiRequest("/tecnicos");
  }

  static async crear(tecnico) {
    const payload = this.toApiPayload(tecnico);
    return apiRequest("/tecnicos", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  static async actualizar(id, tecnico) {
    const payload = this.toApiPayload(tecnico);
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
