// Verifica si un cliente ya tiene un turno asignado
export function clienteYaTieneTurno(clienteId, turnos) {
  return turnos.some((turno) => String(turno.clienteId) === String(clienteId));
}

// Verifica si hay conflicto de horario/nap en una fecha
export function hayConflicto(turnos, fechaISO, hora, nap) {
  return turnos.some(
    (turno) =>
      turno.fecha === fechaISO &&
      turno.hora === hora &&
      String(turno.nap) === String(nap)
  );
}

// Devuelve lista de clientes que aún no tienen turno asignado
export function filtrarClientesDisponibles(clientes, turnos) {
  return clientes.filter((c) => !clienteYaTieneTurno(c.numeroCliente, turnos));
}
