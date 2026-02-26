// turnos.mapper.js
// Transformaciones entre Backend DTO ↔ Frontend Model

/**
 * Backend → Frontend
 */
export function mapTurnoFromBackend(turnoBackend) {
  return {
    id: turnoBackend.id,
    numero_ticket: turnoBackend.numero_ticket,
    fecha: turnoBackend.fecha,
    hora_inicio: turnoBackend.hora_inicio,
    hora_fin: turnoBackend.hora_fin,
    id_cliente: turnoBackend.cliente?.id,
    cliente_nombre: turnoBackend.cliente?.nombre,
    tecnico: turnoBackend.tecnico?.nombre,
    tecnico_id: turnoBackend.tecnico?.id,
    estado: turnoBackend.estado,
    tipo_turno: turnoBackend.tipo_turno,
    rango_horario: turnoBackend.rango_horario
  };
}

export function mapTurnoListFromBackend(listaBackend) {
  return listaBackend.map(mapTurnoFromBackend);
}

/**
 * Frontend → Backend
 */
export function mapTurnoToBackend(turno) {
  return {
    numero_ticket: turno.numero_ticket,
    cliente_id: turno.cliente_id,
    tecnico_id: turno.tecnico_id,
    tipo_turno: turno.tipo_turno,
    rango_horario: turno.rango_horario,
    fecha: turno.fecha,
    hora_inicio: `${turno.hora_inicio}:00`,
    hora_fin: `${turno.hora_fin}:00`,
    estado: "Abierto"
  };
}

export function crearFechaLocalDesdeISO(fechaISO) {
  const [year, month, day] = fechaISO.split("-").map(Number);
  return new Date(year, month - 1, day);
}