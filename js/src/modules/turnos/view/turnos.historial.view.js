// ============================================================
// turnos.historial.view.js — Vista del Historial de Turnos
// ============================================================

import { tokenStorage } from "./../../../core/storage/tokenStorage.js";
import { ToastService } from "./../../../ui/ToastService.js";
import {
  cargarTurnosPorFecha,
  cancelarTurnoById,
} from "../service/turnos.service.js";

import { TIPOS_TURNO } from "../service/turnos.constants.js";
import { actualizarEstadoTurno } from "../service/turnos.api.js";

// ----------------------------------------------------------
// Constantes del módulo
// ----------------------------------------------------------

const ESTADOS_EDITABLES = ["Abierto", "Cerrado", "Reprogramación", "Cancelado"];

const _slug = e => e
  ?.toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/\s+/g, "-") ?? "";


// ----------------------------------------------------------
// Formatters
// ----------------------------------------------------------
// Helper para leer el rol (igual que en main.js)
function getRoleFromToken() {
  try {
    const token = tokenStorage.getToken();
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role ?? null;
  } catch { return null; }
}

// ----------------------------------------------------------
// Formatters
// ----------------------------------------------------------

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

  turnos.forEach(t => container.appendChild(_crearCardHistorial(t, onEliminado)));
}

export function agregarTurnoAlHistorial(turno, container) {
  const card = _crearCardHistorialMinimo(turno);
  container.prepend(card);
}

// ----------------------------------------------------------
// Inicialización del selector de fecha (legacy — mantenido
// por compatibilidad con otros módulos que lo importen)
// ----------------------------------------------------------

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
// Cards
// ----------------------------------------------------------

function _crearCardHistorial(t, onEliminado) {
  const role = getRoleFromToken();
  const card = document.createElement("div");
  card.className = "card-turno";

  const fechaISO      = t.fecha;
  const numeroTicket  = t.numeroTicket  ?? t.numero_ticket;
  const clienteNum    = t.clienteNumero ?? t.cliente?.numero_cliente;
  const clienteNombre = t.clienteNombre ?? t.cliente?.nombre;
  const tecnicoNombre = t.tecnicoNombre ?? t.tecnico?.nombre;
  const tipoTurno     = t.tipoTurno     ?? t.tipo_turno;
  const rangoHorario  = t.rangoHorario  ?? t.rango_horario;
  const horaInicio    = t.horaInicio    ?? t.hora_inicio;
  const horaFin       = t.horaFin       ?? t.hora_fin;
  const estado        = t.estado;

  card.innerHTML = `
    <h3 class="card-fecha-turno">${formatearFecha(fechaISO)}</h3>
    <p><strong>Ticket:</strong> ${formatearTicket(numeroTicket)}</p>
    <p><strong>Cliente:</strong> ${clienteNum} - ${clienteNombre}</p>
    <p><strong>Técnico:</strong> ${tecnicoNombre}</p>
    <p><strong>Tipo Turno:</strong> ${formatearTipo(tipoTurno)}</p>
    <p><strong>Rango Horario:</strong> ${rangoHorario}</p>
    <p><strong>Horario:</strong> ${formatearHora(horaInicio)} - ${formatearHora(horaFin)}</p>
    <p class="estado-label"><strong>Estado:</strong>
      <span class="badge-estado badge-${_slug(estado)}">${formatearEstado(estado)}</span>
    </p>
    <div class="card-acciones">
      ${role === "admin" ? `<button class="btnEditarTurno" data-id="${t.id}">Editar</button>` : ""}
      ${role === "admin" ? `<button class="btnEliminarTurno" data-id="${t.id}">Eliminar</button>` : ""}
    </div>
    <div class="editorEstado" style="display:none"></div>
  `;

  const btnEditar = card.querySelector(".btnEditarTurno");
  if (btnEditar) {
    btnEditar.addEventListener("click", () => _toggleEditorEstado(card, t));
  }

  const btnEliminar = card.querySelector(".btnEliminarTurno");
  if (btnEliminar) {
    btnEliminar.addEventListener("click", () => _onEliminar(
      t,
      card.closest(".historial-turnos") ?? card.parentElement,
      onEliminado,
    ));
  }

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
  const estado        = turno.estado;

  card.innerHTML = `
    <p><strong>Ticket:</strong> ${formatearTicket(ticket)}</p>
    <p><strong>Cliente:</strong> ${clienteNum} - ${clienteNombre}</p>
    <p><strong>Técnico:</strong> ${tecnicoNombre}</p>
    <p><strong>Horario:</strong> ${formatearHora(horaInicio)} - ${formatearHora(horaFin)}</p>
    <p class="estado-label"><strong>Estado:</strong>
      <span class="badge-estado badge-${_slug(estado)}">${formatearEstado(estado)}</span>
    </p>
    <button class="btnEliminarTurno" data-id="${turno.id}">Eliminar</button>
  `;

  return card;
}

// ----------------------------------------------------------
// Eliminar
// ----------------------------------------------------------

async function _onEliminar(turno, container, onEliminado) {
  const id = turno.id;
  try {
    await cancelarTurnoById(id);
  
    // ← Sacar la card del DOM en tiempo real sin recargar todo
    const card = container.querySelector(`[data-id="${id}"]`)?.closest(".card-turno");
    if (card) {
      card.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      card.style.opacity    = "0";
      card.style.transform  = "translateX(20px)";
      setTimeout(() => card.remove(), 300);
    }
  
    // ← Notificar al controller para que refresque turnos y select
    onEliminado?.(id);
  
  } catch (e) {
    console.error("[historial.view] Error eliminando turno:", e);
    ToastService.error("Error al eliminar el turno: " + e.message);
  }
}

// ----------------------------------------------------------
// Editor de estado inline
// ----------------------------------------------------------

function _toggleEditorEstado(card, turno) {
  const editor = card.querySelector(".editorEstado");
  const estaAbierto = editor.style.display === "block";

  editor.style.display = estaAbierto ? "none" : "block";
  if (estaAbierto) return;

  editor.innerHTML = `
    <select class="select-horarios-manual select-estado-editor">
      <option value="">Seleccionar nuevo estado</option>
      ${ESTADOS_EDITABLES.map(e =>
        `<option value="${e}" ${turno.estado === e ? "selected" : ""}>${e}</option>`
      ).join("")}
    </select>
    <button class="btnConfirmarManual btnConfirmarEstado">Confirmar</button>
    <p class="mensaje-editor" style="display:none"></p>
  `;

  editor.querySelector(".btnConfirmarEstado")
    .addEventListener("click", () => _confirmarEdicionEstado(card, turno, editor));
}

async function _confirmarEdicionEstado(card, turno, editor) {
  const select      = editor.querySelector(".select-estado-editor");
  const nuevoEstado = select.value;
  const msgEl       = editor.querySelector(".mensaje-editor");

  if (!nuevoEstado) {
    ToastService.error("⚠️ Seleccioná un estado", "error");
    return;
  }

  try {
    await actualizarEstadoTurno(turno.id, nuevoEstado);

    const badge     = card.querySelector(".badge-estado");
    badge.textContent = formatearEstado(nuevoEstado);
    badge.className   = `badge-estado badge-${_slug(nuevoEstado)}`;

    turno.estado = nuevoEstado;

    editor.style.display = "none";
    ToastService.success("✅ Estado actualizado", "ok");

  } catch (e) {
    ToastService.error("❌ Error: " + e.message, "error");
  }
}

