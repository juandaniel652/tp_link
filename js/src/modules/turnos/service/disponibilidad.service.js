// ============================================================
// disponibilidad.service.js — Lógica de disponibilidad horaria
// ============================================================
// Migrado desde validaciones.js + lógica de grilla.js
// ============================================================

import { DURACION_BLOQUE_MIN, LIMITES_RANGO } from "./turnos.constants.js";

// ----------------------------------------------------------
// Helpers internos
// ----------------------------------------------------------

/**
 * Considera un turno inactivo si su estado es Cancelado.
 * Soporta ViewModel (camelCase) y raw backend (snake_case).
 */
function _esCancelado(turno) {
  const estado = turno.estado ?? "";
  return estado.toLowerCase() === "cancelado";
}

/**
 * Expande una hora de inicio en `t` bloques de 15 min.
 * @param {string} horaInicio — "HH:MM"
 * @param {number} t          — cantidad de bloques
 * @returns {string[]}          array de "HH:MM"
 */
function expandirBloquesDesde(horaInicio, t) {
  const [h, m] = horaInicio.split(":").map(Number);
  const bloques = [];
  let hora   = h;
  let minuto = m;

  for (let i = 0; i < t; i++) {
    bloques.push(
      `${String(hora).padStart(2, "0")}:${String(minuto).padStart(2, "0")}`
    );
    minuto += DURACION_BLOQUE_MIN;
    if (minuto >= 60) {
      hora   += Math.floor(minuto / 60);
      minuto  = minuto % 60;
    }
  }
  return bloques;
}

/**
 * Expande los bloques ocupados por un turno existente
 * usando su hora_inicio y hora_fin.
 * @param {Object} turno — ViewModel o registro del backend
 * @returns {string[]}
 */
function expandirTurno(turno) {
  if (!turno?.hora_inicio || !turno?.horaInicio) {
    // Soporta tanto snake_case (backend) como camelCase (ViewModel)
  }

  const inicio = (turno.horaInicio ?? turno.hora_inicio)?.slice(0, 5);
  const fin    = (turno.horaFin    ?? turno.hora_fin)?.slice(0, 5);

  if (!inicio || !fin) {
    console.warn("Turno inválido en expandirTurno:", turno);
    return [];
  }

  const bloques = [];
  let actual = inicio;

  while (actual < fin) {
    bloques.push(actual);
    const [h, m] = actual.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m + DURACION_BLOQUE_MIN, 0, 0);
    actual = d.toTimeString().slice(0, 5);
  }

  return bloques;
}

// ----------------------------------------------------------
// Normalización
// ----------------------------------------------------------

function normalizarTexto(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// ----------------------------------------------------------
// API pública
// ----------------------------------------------------------

/**
 * Verifica si un cliente ya tiene algún turno asignado.
 * Soporta ViewModel ({ clienteId }) y raw backend ({ cliente.id }).
 * @param {string|number} clienteId
 * @param {Object[]}      turnos
 * @returns {boolean}
 */
export function clienteYaTieneTurno(clienteId, turnos) {
  return turnos.some(t => {
    if (_esCancelado(t)) return false;
    const id = t.clienteId ?? t.cliente?.id;
    console.log("comparando:", String(id), "===", String(clienteId), "→", String(id) === String(clienteId));
    return String(id) === String(clienteId);
  });
}

/**
 * Detecta conflicto de horario para un técnico (y opcionalmente cliente).
 *
 * @param {Object[]}      turnos           — turnos existentes
 * @param {string}        fechaISO         — "YYYY-MM-DD"
 * @param {string}        hora             — "HH:MM"
 * @param {string}        tecnicoNombre    — "Nombre Apellido"
 * @param {string|number} [clienteId=null]
 * @param {number}        [t=1]            — bloques del candidato
 * @returns {boolean}
 */
export function hayConflicto(
  turnos,
  fechaISO,
  hora,
  tecnicoNombre,
  clienteId = null,
  t = 1
) {
  const horaNorm         = hora.slice(0, 5);
  const bloquesCandidato = expandirBloquesDesde(horaNorm, t);

  return turnos.some(turno => {
    // Fecha distinta → no hay conflicto
    const fechaTurno = turno.fecha;
    if (fechaTurno !== fechaISO) return false;

    const bloquesExistente = expandirTurno(turno);

    // Nombre del técnico (ViewModel o raw)
    const nombreTecnico =
      turno.tecnicoNombre
        ? `${turno.tecnicoNombre} ${turno.tecnicoApellido ?? ""}`.trim()
        : `${turno.tecnico?.nombre ?? ""} ${turno.tecnico?.apellido ?? ""}`.trim();

    const tecnicoIgual = nombreTecnico === tecnicoNombre;

    const idCliente = turno.clienteId ?? turno.cliente?.id;
    const clienteIgual = clienteId
      ? String(idCliente) === String(clienteId)
      : false;

    const hayInterseccion = bloquesCandidato.some(b =>
      bloquesExistente.includes(b)
    );

    return (tecnicoIgual && hayInterseccion) || (clienteIgual && hayInterseccion);
  });
}

/**
 * Filtra clientes que aún no tienen turno.
 * @param {Object[]} clientes
 * @param {Object[]} turnos
 * @returns {Object[]}
 */
export function filtrarClientesDisponibles(clientes, turnos) {
  return clientes.filter(c => !clienteYaTieneTurno(c.id ?? c.numero_cliente, turnos));
}

/**
 * Filtra un array de horarios "HH:MM" según rango AM/PM y T.
 * @param {string[]} horarios
 * @param {"AM"|"PM"} rango
 * @param {number}   tNum
 * @returns {string[]}
 */
export function filtrarPorRango(horarios, rango, tNum = 1) {
  const limites = LIMITES_RANGO[rango];
  if (!limites) return horarios;

  return horarios.filter(hora => {
    const [h, m] = hora.split(":").map(Number);
    const inicio = h * 60 + m;
    const fin    = inicio + tNum * DURACION_BLOQUE_MIN;
    return inicio >= limites.inicio && fin <= limites.fin;
  });
}

/**
 * Devuelve los horarios disponibles para un técnico en una fecha,
 * excluyendo bloques con conflicto para ese técnico y/o cliente.
 *
 * @param {Object[]}      turnos
 * @param {string}        fechaISO
 * @param {Object}        tecnico    — instancia con .generarBloques() y .nombre/.apellido
 * @param {string}        diaNombre  — nombre del día (puede tener tildes)
 * @param {string|number} [clienteId=null]
 * @param {number}        [t=1]
 * @returns {string[]}   array de "HH:MM" disponibles
 */
export function obtenerHorariosDisponibles(
  turnos,
  fechaISO,
  tecnico,
  diaNombre,
  clienteId = null,
  t = 1
) {
  const diaNorm = normalizarTexto(diaNombre);

  // Normalizar claves del mapa de bloques del técnico
  const bloquesPorDia = Object.fromEntries(
    Object.entries(tecnico.generarBloques()).map(([k, v]) => [
      normalizarTexto(k),
      v,
    ])
  );

  const bloquesDia = bloquesPorDia[diaNorm] ?? [];

  return bloquesDia.filter(hora =>
    !hayConflicto(
      turnos,
      fechaISO,
      hora,
      `${tecnico.nombre} ${tecnico.apellido}`,
      clienteId,
      t
    )
  );
}

/**
 * Obtiene hasta 3 fechas futuras disponibles para el técnico
 * sin conflicto de cliente.
 *
 * @param {Object}        tecnico
 * @param {Object[]}      turnos
 * @param {string|number} clienteId
 * @param {number}        [maxFechas=3]
 * @param {number}        [maxDias=30]
 * @returns {{ fecha: Date, fechaISO: string, diaNombre: string }[]}
 */
export function obtenerFechasDisponibles(
  tecnico,
  turnos,
  clienteId,
  maxFechas = 3,
  maxDias   = 30
) {
  const diasDisponibles = tecnico
    .getDiasDisponibles()
    .map(d => normalizarTexto(d));

  const fechasOpciones = [];
  const iterFecha = new Date();
  let contador = 0;

  while (fechasOpciones.length < maxFechas && contador < maxDias) {
    iterFecha.setDate(iterFecha.getDate() + 1);
    contador++;

    const fechaLocal = new Date(
      iterFecha.getFullYear(),
      iterFecha.getMonth(),
      iterFecha.getDate()
    );

    // Saltar domingos
    if (fechaLocal.getDay() === 0) continue;

    const diaNombre = normalizarTexto(
      fechaLocal.toLocaleDateString("es-ES", { weekday: "long" })
    );

    // Saltar días no disponibles para el técnico
    if (!diasDisponibles.some(d => d === diaNombre)) continue;

    const fechaISO = [
      fechaLocal.getFullYear(),
      String(fechaLocal.getMonth() + 1).padStart(2, "0"),
      String(fechaLocal.getDate()).padStart(2, "0"),
    ].join("-");

    // Saltar si el cliente ya tiene turno ese día
    const conflictoCliente = turnos.some(
      turno =>
        !_esCancelado(turno) &&
        String(turno.clienteId ?? turno.cliente?.id ?? turno.cliente_id) === String(clienteId) &&
        turno.fecha === fechaISO
    );
    if (conflictoCliente) continue;

    fechasOpciones.push({ fecha: fechaLocal, fechaISO, diaNombre });
  }

  return fechasOpciones;
}