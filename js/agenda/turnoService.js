import { apiRequest } from "../api/apiRequest.js";

function parseFechaISOToLocal(fechaISO) {
  if (!fechaISO) return null;
  const [y, m, d] = fechaISO.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export class TurnoService {

  async obtenerTodos() {
    const arr = await apiRequest("/turnos");

    return arr.map(t => ({
      ...t,
      fechaObj: parseFechaISOToLocal(
        t.fecha_hora?.split("T")[0]
      )
    }));
  }

  async crear(turno) {
    return apiRequest("/turnos", {
      method: "POST",
      body: JSON.stringify(turno)
    });
  }

  async actualizar(id, turno) {
    return apiRequest(`/turnos/${id}`, {
      method: "PUT",
      body: JSON.stringify(turno)
    });
  }

  async eliminar(id) {
    return apiRequest(`/turnos/${id}`, {
      method: "DELETE"
    });
  }

}

export class TurnoService {

  async obtenerTodos() {

    const turnos = await apiRequest("/turnos");

    return turnos.map(t => ({

      id: t.id,

      fecha: t.fecha,

      hora_inicio: t.hora_inicio.slice(0,5),

      hora_fin: t.hora_fin.slice(0,5),

      tecnico_id: t.tecnico.id,

      tecnico_nombre: `${t.tecnico.nombre} ${t.tecnico.apellido}`,

      cliente_id: t.cliente.id,

      cliente_nombre: `${t.cliente.nombre} ${t.cliente.apellido}`,

      estado: t.estado,

      numero_ticket: t.numero_ticket

    }));

  }

}