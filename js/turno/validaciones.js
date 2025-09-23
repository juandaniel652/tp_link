// ===============================
// Validaciones de turnos según técnicos
// ===============================

// Verifica si un cliente ya tiene un turno asignado
export function clienteYaTieneTurno(clienteId, turnos) {
  return turnos.some(turno => String(turno.clienteId) === String(clienteId));
}

// Verifica si hay conflicto de horario para un técnico en una fecha
export function hayConflicto(turnos, fechaISO, hora, tecnicoNombre) {
  return turnos.some(
    turno =>
      turno.fecha === fechaISO &&
      turno.hora === hora &&
      turno.tecnico === tecnicoNombre // 👈 ahora guardamos un solo técnico como string
  );
}

// Devuelve lista de clientes que aún no tienen turno asignado
export function filtrarClientesDisponibles(clientes, turnos) {
  return clientes.filter(c => !clienteYaTieneTurno(c.numeroCliente, turnos));
}

// Devuelve horarios disponibles para un técnico en una fecha
export function obtenerHorariosDisponibles(turnos, fechaISO, tecnico, diaNombre) {
  // tecnico: instancia de la clase Tecnico
  const bloquesPorDia = tecnico.generarBloques();
  const bloquesDia = bloquesPorDia[diaNombre] || []; // bloques del día específico

  // Filtrar los bloques que ya tengan un turno asignado
  return bloquesDia.filter(hora => !hayConflicto(turnos, fechaISO, hora, `${tecnico.nombre} ${tecnico.apellido}`));
}
