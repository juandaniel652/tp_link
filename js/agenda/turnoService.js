import { apiRequest } from "../api/apiRequest.js";

function parseFechaISOToLocal(fechaISO) {
  if (!fechaISO) return null;
  const [y, m, d] = fechaISO.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export class TurnoService {
  static obtenerTodos() {
    // devuelve la lista de turnos desde el backend
    return apiRequest("/turnos").then(arr =>
      arr.map(t => ({ ...t, fechaObj: parseFechaISOToLocal(t.fecha_hora?.split("T")[0]) }))
    );
  }

  static crear(turno) {
    return apiRequest("/turnos", {
      method: "POST",
      body: JSON.stringify(turno)
    });
  }

  static actualizar(id, turno) {
    return apiRequest(`/turnos/${id}`, {
      method: "PUT",
      body: JSON.stringify(turno)
    });
  }

  static eliminar(id) {
    return apiRequest(`/turnos/${id}`, { method: "DELETE" });
  }
}
