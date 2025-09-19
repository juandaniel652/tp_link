// Verifica si un cliente ya tiene un turno asignado
export function clienteYaTieneTurno(clienteId, turnos) {
  return turnos.some((turno) => String(turno.clienteId) === String(clienteId));
}

// Extrae un HH:MM desde cualquier string (p. ej. "09:00 - 10:30" -> "09:00")
function extraerHHMM(cadena) {
  if (!cadena && cadena !== "") return null;
  const match = String(cadena).match(/(\d{1,2}:\d{2})/);
  return match ? match[1].padStart(5, "0") : null;
}

function horaAminutos(hhmm) {
  const hh = extraerHHMM(hhmm);
  if (!hh) return NaN;
  const [h, m] = hh.split(":").map(Number);
  return h * 60 + (m || 0);
}

// Verifica si hay conflicto (solapamiento) de horario/nap en una fecha
// considera duración en bloques de 15 minutos (tNum)
export function hayConflicto(turnos, fechaISO, horaInicio, nap, tNum = 1) {
  const nuevoInicio = horaAminutos(horaInicio);
  if (Number.isNaN(nuevoInicio)) return false; // formato inválido -> no consideramos conflicto aquí
  const nuevoFin = nuevoInicio + Number(tNum || 1) * 15;

  return turnos.some((turno) => {
    if (turno.fecha !== fechaISO) return false;
    if (String(turno.nap) !== String(nap)) return false;

    const inicioExistente = horaAminutos(turno.hora);
    if (Number.isNaN(inicioExistente)) return false; // si el turno guardado tiene formato raro, no lo usamos (aunque luego normalizamos)
    const tExistente = Number(turno.t) || 1;
    const finExistente = inicioExistente + tExistente * 15;

    // Solapamiento: newStart < existingEnd && existingStart < newEnd
    return nuevoInicio < finExistente && inicioExistente < nuevoFin;
  });
}

// Devuelve lista de clientes que aún no tienen turno asignado
export function filtrarClientesDisponibles(clientes, turnos) {
  return clientes.filter((c) => !clienteYaTieneTurno(c.numeroCliente, turnos));
}
