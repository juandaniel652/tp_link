import { apiRequest } from "../api/apiRequest.js";

export class TurnoService {

  async obtenerTodos() {

    const turnos = await apiRequest("/turnos");

    return turnos.map(t => {

      const horaInicio = t.hora_inicio.slice(0,5);
      const horaFin = t.hora_fin.slice(0,5);

      // calcular bloques de 15 min
      const [h1,m1] = horaInicio.split(":").map(Number);
      const [h2,m2] = horaFin.split(":").map(Number);

      const bloques = ((h2*60 + m2) - (h1*60 + m1)) / 15;

      const clienteNombre =
        t.cliente
          ? `${t.cliente.nombre} ${t.cliente.apellido}`
          : "Sin cliente";

      const tecnicoNombre =
        t.tecnico
          ? `${t.tecnico.nombre} ${t.tecnico.apellido}`
          : "Sin técnico";

      return {

        // internos
        id: t.id,
        numero_ticket: t.numero_ticket,

        // necesarios para AgendaUI
        fecha: t.fecha,

        hora: horaInicio,

        t: bloques,

        rango: `${horaInicio} - ${horaFin}`,

        cliente: clienteNombre,

        tecnico: tecnicoNombre,

        estadoTicket: t.estado,

        color: this.obtenerColorEstado(t.estado),

        // útiles para futuras operaciones
        cliente_id: t.cliente?.id,
        tecnico_id: t.tecnico?.id

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
    return apiRequest("/turnos",{
      method:"POST",
      body:JSON.stringify(turno)
    });
  }

}