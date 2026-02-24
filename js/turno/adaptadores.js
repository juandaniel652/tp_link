// Convierte TurnoResponse del backend → formato que usa el frontend

export function adaptarTurnoBackend(turnoBackend) {

  return {

    id: turnoBackend.id,

    numero_ticket: turnoBackend.numero_ticket,

    fecha: turnoBackend.fecha,

    hora_inicio: turnoBackend.hora_inicio,
    hora_fin: turnoBackend.hora_fin,

    // formato que usa validaciones.js
    id_cliente: turnoBackend.cliente?.id,

    tecnico: turnoBackend.tecnico?.nombre,

    cliente_nombre: turnoBackend.cliente?.nombre,

    tecnico_id: turnoBackend.tecnico?.id,

    estado: turnoBackend.estado,

    tipo_turno: turnoBackend.tipo_turno,

    rango_horario: turnoBackend.rango_horario
  };

}


// adapta lista completa
export function adaptarListaTurnos(listaBackend) {

  return listaBackend.map(adaptarTurnoBackend);

}