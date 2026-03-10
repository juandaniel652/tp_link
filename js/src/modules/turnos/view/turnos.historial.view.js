// ============================================================
// turnos.historial.view.js — Vista del Historial de Turnos
// ============================================================
// Migrado desde historial.js + formatoTurno.js
// ============================================================

import {
  cargarTurnos,
  cargarTurnosPorFecha,
  cancelarTurnoById,
} from "../service/turnos.service.js";
import { TIPOS_TURNO } from "../service/turnos.constants.js";

// ----------------------------------------------------------
// Formatters (anteriormente formatoTurno.js)
// ----------------------------------------------------------

/**
 * Crea un objeto Date local a partir de "YYYY-MM-DD"
 * sin desfase de zona horaria.
 */
export function crearFechaLocal(fechaISO) {
  const [y, m, d] = fechaISO.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatearFecha(fechaISO) {
  return crearFechaLocal(fechaISO).toLocaleDateString("es-AR", {
    weekday: "long",
    year:    "numeric",
    month:   "long",
    day:     "numeric",
  });
}

export function formatearHora(hora) {
  return hora?.slice(0, 5) ?? "";
}

export function formatearEstado(estado) {
  if (!estado) return "";
  return estado.charAt(0).toUpperCase() + estado.slice(1);
}

export function formatearTipo(tipo) {
  return TIPOS_TURNO[tipo] ?? `Tipo ${tipo}`;
}

export function formatearTicket(numero_ticket) {
  return numero_ticket?.split("_")[1] ?? numero_ticket;
}

// ----------------------------------------------------------
// Render principal
// ----------------------------------------------------------

/**
 * Renderiza la lista de turnos como cards dentro de `container`.
 * Acepta ViewModels (camelCase) o respuestas crudas del backend.
 *
 * @param {Object[]}  turnos
 * @param {HTMLElement} container
 * @param {Function}  [onEliminado] — callback (id) => void
 */
export function renderHistorialTurnos(turnos, container, onEliminado) {
  if (!container) {
    console.error("[historial.view] container no definido");
    return;
  }

  container.innerHTML = "";

  if (!turnos?.length) {
    container.innerHTML = "<p>No hay turnos para esta fecha</p>";
    return;
  }

  turnos.forEach(t => {
    const card = _crearCardHistorial(t);
    container.appendChild(card);

    card.querySelector(".btnEliminarTurno")
      .addEventListener("click", () => _onEliminar(t, container, onEliminado));
  });
}

/**
 * Agrega un único turno recién creado al tope del historial.
 * @param {Object}    turno
 * @param {HTMLElement} container
 */
export function agregarTurnoAlHistorial(turno, container) {
  const card = _crearCardHistorialMinimo(turno);
  container.prepend(card);
}

// ----------------------------------------------------------
// Inicialización del selector de fecha
// ----------------------------------------------------------

/**
 * Configura el selector de fecha para recargar el historial.
 * @param {HTMLElement} selectorEl
 * @param {HTMLElement} container
 */
export function inicializarSelectorFecha(selectorEl, container) {
  selectorEl.addEventListener("change", async () => {
    const fecha = selectorEl.value;
    if (!fecha) return;

    try {
      const turnos = await cargarTurnosPorFecha(fecha);
      renderHistorialTurnos(turnos, container);
    } catch (e) {
      console.error("[historial.view] Error cargando por fecha:", e);
    }
  });
}

// ----------------------------------------------------------
// Helpers privados
// ----------------------------------------------------------

function _crearCardHistorial(t) {
  const card = document.createElement("div");
  card.className = "card-turno";

  // Soporta ViewModel (camelCase) y raw backend (snake_case)
  const fechaISO       = t.fecha;
  const numeroTicket   = t.numeroTicket   ?? t.numero_ticket;
  const clienteNum     = t.clienteNumero  ?? t.cliente?.numero_cliente;
  const clienteNombre  = t.clienteNombre  ?? t.cliente?.nombre;
  const tecnicoNombre  = t.tecnicoNombre  ?? t.tecnico?.nombre;
  const tipoTurno      = t.tipoTurno      ?? t.tipo_turno;
  const rangoHorario   = t.rangoHorario   ?? t.rango_horario;
  const horaInicio     = t.horaInicio     ?? t.hora_inicio;
  const horaFin        = t.horaFin        ?? t.hora_fin;
  const estado         = t.estado;

  card.innerHTML = `
    <h3 class="card-fecha-turno">${formatearFecha(fechaISO)}</h3>
    <p><strong>Ticket:</strong> ${formatearTicket(numeroTicket)}</p>
    <p><strong>Cliente:</strong> ${clienteNum} - ${clienteNombre}</p>
    <p><strong>Técnico:</strong> ${tecnicoNombre}</p>
    <p><strong>Tipo Turno:</strong> ${formatearTipo(tipoTurno)}</p>
    <p><strong>Rango Horario:</strong> ${rangoHorario}</p>
    <p><strong>Horario:</strong> ${formatearHora(horaInicio)} - ${formatearHora(horaFin)}</p>
    <p><strong>Estado:</strong> ${formatearEstado(estado)}</p>
    <button class="btnEliminarTurno" data-id="${t.id}">Eliminar</button>
  `;

  return card;
}

function _crearCardHistorialMinimo(turno) {
  const card = document.createElement("div");
  card.className = "card-turno";

  const clienteNum    = turno.clienteNumero ?? turno.cliente?.numero_cliente;
  const clienteNombre = turno.clienteNombre ?? turno.cliente?.nombre;
  const tecnicoNombre = turno.tecnicoNombre ?? turno.tecnico?.nombre;
  const horaInicio    = turno.horaInicio    ?? turno.hora_inicio;
  const horaFin       = turno.horaFin       ?? turno.hora_fin;
  const ticket        = turno.numeroTicket  ?? turno.numero_ticket;

  card.innerHTML = `
    <p><strong>Ticket:</strong> ${formatearTicket(ticket)}</p>
    <p><strong>Cliente:</strong> ${clienteNum} - ${clienteNombre}</p>
    <p><strong>Técnico:</strong> ${tecnicoNombre}</p>
    <p><strong>Horario:</strong> ${formatearHora(horaInicio)} - ${formatearHora(horaFin)}</p>
    <p><strong>Estado:</strong> ${formatearEstado(turno.estado)}</p>
    <button class="btnEliminarTurno" data-id="${turno.id}">Eliminar</button>
  `;

  return card;
}

async function _onEliminar(turno, container, onEliminado) {
  const id = turno.id;
  try {
    await cancelarTurnoById(id);

    // Recargar historial del día si hay selector activo
    const selector = document.getElementById("selectorFechaHistorial");
    if (selector?.value) {
      const turnos = await cargarTurnosPorFecha(selector.value);
      renderHistorialTurnos(turnos, container, onEliminado);
    } else {
      const turnos = await cargarTurnos();
      renderHistorialTurnos(turnos, container, onEliminado);
    }

    onEliminado?.(id);
  } catch (e) {
    console.error("[historial.view] Error eliminando turno:", e);
    alert("Error al eliminar el turno: " + e.message);
  }
}