import { apiRequest } from "../api/apiRequest.js";

export class TurnoService {

  async obtenerTodos() {

    const turnos = await apiRequest("/turnos");

    return turnos.map(t => {

      const horaInicio = t.hora_inicio.slice(0,5);
      const horaFin = t.hora_fin.slice(0,5);

      return {

        id: t.id,
        numero_ticket: t.numero_ticket,

        fecha: t.fecha,

        hora_inicio: horaInicio,
        hora_fin: horaFin,

        cliente: t.cliente || null,

        tecnico: t.tecnico || null,

        estado: t.estado,

        color: this.obtenerColorEstado(t.estado)

      };

    });

  }

  obtenerColorEstado(estado){

    switch(estado){

      case "pendiente":
        return "#f39c12";

      case "confirmado":
        return "#1E90FF";

      case "cancelado":
        return "#e74c3c";

      case "completado":
        return "#27ae60";

      default:
        return "#7f8c8d";
    }

  }

  async crear(turno){

    // generar numero_ticket único
    const numero_ticket =
      turno.cliente_id + "_" + Date.now();

    const payload = {

      numero_ticket: numero_ticket,

      cliente_id: turno.cliente_id,

      tecnico_id: turno.tecnico_id,

      tipo_turno: turno.tipo_turno ?? 1,

      rango_horario: turno.rango_horario,

      estado: turno.estado ?? "confirmado",

      fecha: turno.fecha,

      hora_inicio: turno.hora_inicio,

      hora_fin: turno.hora_fin

    };

    return apiRequest("/turnos",{
      method:"POST",
      body:JSON.stringify(payload)
    });

  }

}