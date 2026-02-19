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

    const formData = new FormData();
    
    formData.append("nombre", data.nombre);
    formData.append("apellido", data.apellido);
    
    if (data.telefono)
      formData.append("telefono", data.telefono);
  
    if (data.email)
      formData.append("email", data.email);
  
    formData.append("duracion_turno_min", data.duracion_turno_min);
  
    if (data.imagen instanceof File)
      formData.append("imagen", data.imagen);
  
    if (Array.isArray(data.horarios))
      formData.append("horarios", JSON.stringify(data.horarios));
  
    return apiRequest("/tecnicos", {
      method: "POST",
      body: formData
    });
  
  }



  static actualizar(id, data) {

    const formData = new FormData();

    formData.append("nombre", data.nombre);
    formData.append("apellido", data.apellido);

    if (data.telefono)
      formData.append("telefono", data.telefono);

    if (data.email)
      formData.append("email", data.email);

    formData.append("duracion_turno_min", data.duracion_turno_min);

    // caso 1: nueva imagen
    if (data.imagen instanceof File) {
      formData.append("imagen", data.imagen);
    }

    // caso 2: mantener imagen existente (url string)
    else if (typeof data.imagen === "string" && data.imagen.length > 0) {
      formData.append("imagen_url", data.imagen);
    }

    // horarios si existen
    if (Array.isArray(data.horarios)) {
      formData.append("horarios", JSON.stringify(data.horarios));
    }

    return apiRequest(`/tecnicos/${id}`, {
      method: "PUT",
      body: formData
    });

  }


  static eliminar(id) {
    return apiRequest(`/tecnicos/${id}`, { method: "DELETE" });
  }
}
