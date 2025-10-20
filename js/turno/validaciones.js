// ===============================
// Validaciones de turnos según técnicos
// ===============================

// Verifica si un cliente ya tiene un turno asignado
export function clienteYaTieneTurno(clienteId, turnos) {
  return turnos.some(turno => String(turno.clienteId) === String(clienteId));
}

// Verifica si hay conflicto de horario para un técnico en una fecha
export function hayConflicto(turnos, fechaISO, hora, tecnicoNombre) {
  const horaNorm = hora.slice(0,5); // "HH:MM"
  return turnos.some(turno => {
    if (turno.fecha !== fechaISO || turno.tecnico !== tecnicoNombre) return false;
    const bloques = expandirTurno(turno);
    return bloques.includes(horaNorm);
  });
}

// Devuelve lista de clientes que aún no tienen turno asignado
export function filtrarClientesDisponibles(clientes, turnos) {
  return clientes.filter(c => !clienteYaTieneTurno(c.numeroCliente, turnos));
}

// Devuelve horarios disponibles para un técnico en una fecha
export function obtenerHorariosDisponibles(turnos, fechaISO, tecnico, diaNombre) {

  // 🔧 Normaliza el nombre del día (quita tildes, minúsculas)
  const diaNormalizado = diaNombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const bloquesPorDia = Object.fromEntries(
    Object.entries(tecnico.generarBloques()).map(([k, v]) => [
      k.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(),
      v
    ])
  );

  const bloquesDia = bloquesPorDia[diaNormalizado] || [];

  return bloquesDia.filter(hora =>
    !hayConflicto(turnos, fechaISO, hora, `${tecnico.nombre} ${tecnico.apellido}`)
  );
}

// Mide los T ocupados en agenda, de esa manera no muestra turnos ocupados ya por el mismo técnico
function expandirTurno(turno) {
  const [h, m] = turno.hora.split(":").map(Number);
  const bloques = [];
  let hora = h;
  let minuto = m;

  for (let i = 0; i < turno.t; i++) {
    const horaStr = `${String(hora).padStart(2,"0")}:${String(minuto).padStart(2,"0")}`;
    bloques.push(horaStr);

    minuto += turno.duracion || 15; // 👈 usar duración real del técnico si la guardás, si no fijo 15
    if (minuto >= 60) {
      hora += Math.floor(minuto / 60);
      minuto = minuto % 60;
    }
  }
  return bloques;
}
