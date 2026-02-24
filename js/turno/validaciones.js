// ===============================
// Validaciones de turnos según técnicos
// ===============================

// Verifica si un cliente ya tiene un turno asignado
export function clienteYaTieneTurno(clienteId, turnos) {
  return turnos.some(turno => String(turno.id_cliente) === String(clienteId));
}

// Helper: expande un horario inicial + cantidad de bloques t -> array de "HH:MM"
function expandirBloquesDesde(horaInicio, t, duracion = 15) {
  const [h, m] = horaInicio.split(":").map(Number);
  const bloques = [];
  let hora = h;
  let minuto = m;

  for (let i = 0; i < t; i++) {
    bloques.push(`${String(hora).padStart(2,"0")}:${String(minuto).padStart(2,"0")}`);
    minuto += duracion;
    if (minuto >= 60) {
      hora += Math.floor(minuto / 60);
      minuto = minuto % 60;
    }
  }
  return bloques;
}

// Verifica si hay conflicto de horario para un técnico y opcionalmente para un cliente
// Ahora acepta 't' = cantidad de bloques del turno candidato (por defecto 1)
export function hayConflicto(turnos, fechaISO, hora, tecnicoNombre, clienteId = null, t = 1) {
  const horaNorm = hora.slice(0,5); // "HH:MM"
  const bloquesCandidato = expandirBloquesDesde(horaNorm, t);

  return turnos.some(turno => {
    if (turno.fecha !== fechaISO) return false;

    const bloquesExistente = expandirTurno(turno); // usa turno.t del turno guardado (cantidad de bloques)
    const tecnicoIgual = turno.tecnico === tecnicoNombre;
    const clienteIgual = clienteId ? String(turno.id_cliente) === String(clienteId) : false;

    // Si cualquiera de los bloques candidatos está en los bloques existentes => conflicto
    const hayInterseccion = bloquesCandidato.some(b => bloquesExistente.includes(b));

    // conflicto por técnico o por cliente (si se pasa clienteId)
    return (tecnicoIgual && hayInterseccion) || (clienteIgual && hayInterseccion);
  });
}

// Devuelve lista de clientes que aún no tienen turno asignado
export function filtrarClientesDisponibles(clientes, turnos) {
  return clientes.filter(c => !clienteYaTieneTurno(c.numeroCliente, turnos));
}

// Devuelve horarios disponibles para un técnico en una fecha
// ahora acepta 't' (cantidad de bloques requeridos)
export function obtenerHorariosDisponibles(turnos, fechaISO, tecnico, diaNombre, clienteId = null, t = 1) {

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
    // pasamos 't' para que se comprueben todos los bloques del candidato
    !hayConflicto(turnos, fechaISO, hora, `${tecnico.nombre} ${tecnico.apellido}`, clienteId, t)
  );
}

// Mide los T ocupados en agenda, de esa manera no muestra turnos ocupados ya por el mismo técnico
function expandirTurno(turno) {

  if (!turno.hora_inicio || !turno.hora_fin)
    return [];

  const bloques = [];

  let actual = turno.hora_inicio.slice(0,5);
  const fin = turno.hora_fin.slice(0,5);

  while (actual < fin) {

    bloques.push(actual);

    const [h, m] = actual.split(":").map(Number);

    const fecha = new Date();
    fecha.setHours(h);
    fecha.setMinutes(m + 15);

    actual = fecha.toTimeString().slice(0,5);

  }

  return bloques;

}
