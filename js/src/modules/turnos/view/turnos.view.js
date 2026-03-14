// ============================================================
// turnos.view.js — Vista principal: grilla + selects
// ============================================================
// Migrado desde grilla.js + render_selects.js + formateo.js
// ============================================================

// Agregar al bloque de imports
import { ToastService } from "@/ui/ToastService.js";
import { DURACION_BLOQUE_MIN} from "../service/turnos.constants.js";
import {
  hayConflicto,
  obtenerHorariosDisponibles,
  filtrarPorRango,
  obtenerFechasDisponibles,
} from "../service/disponibilidad.service.js";
import { clienteYaTieneTurno }   from "../service/disponibilidad.service.js";
import { resolverCliente }       from "../service/andros.service.js";
import { agregarTurnoAlHistorial } from "./turnos.historial.view.js";
import { TurnoModel }            from "../model/turno.model.js";

// ============================================================
// Formatters (anteriormente formateo.js)
// ============================================================

/**
 * Devuelve string "09:00 - 09:30 (30 Minutos)"
 * @param {string} horaBase — "HH:MM"
 * @param {number} tNum     — cantidad de bloques
 */
export function formatearRango(horaBase, tNum) {
  const [h, m] = horaBase.split(":").map(Number);

  const inicio = new Date();
  inicio.setHours(h, m, 0, 0);

  const fin = new Date(inicio);
  fin.setMinutes(inicio.getMinutes() + tNum * DURACION_BLOQUE_MIN);

  const pad = n => n.toString().padStart(2, "0");
  const inicioStr = `${pad(inicio.getHours())}:${pad(inicio.getMinutes())}`;
  const finStr    = `${pad(fin.getHours())}:${pad(fin.getMinutes())}`;

  return `${inicioStr} - ${finStr} (${tNum * DURACION_BLOQUE_MIN} Minutos)`;
}

// ============================================================
// render_selects (anteriormente render_selects.js)
// ============================================================

/**
 * Renderiza el select de clientes, deshabilitando los que
 * ya tienen turno.
 */
export function renderSelectClientes(selectEl, clientes, turnos = []) {
  selectEl.innerHTML = `<option value="">Seleccionar Cliente</option>`;

  clientes.forEach(c => {
    const option = document.createElement("option");
    option.value = c.id;
    option.textContent = `${c.nombre} ${c.apellido} — ID: ${c.numero_cliente}`;

    if (clienteYaTieneTurno(c.id, turnos)) {
      option.disabled = true;
      option.textContent += " (Ya tiene turno)";
      option.classList.add("opcion-desactivada");
    }

    selectEl.appendChild(option);
  });
}

/** Renderiza el select de técnicos. */
export function renderSelectTecnicos(selectEl, tecnicos) {
  selectEl.innerHTML = "<option value=''>Seleccionar Técnico</option>";
  tecnicos.forEach(tecnico => {
    const option = document.createElement("option");
    option.value = tecnico.id;
    option.textContent = `${tecnico.nombre} ${tecnico.apellido}`;
    selectEl.appendChild(option);
  });
}

/**
 * Renderiza un select genérico con items simples.
 * @param {HTMLSelectElement} selectEl
 * @param {any[]}   items
 * @param {string}  placeholder
 * @param {string}  [prefix=""]
 */
export function renderSelectGen(selectEl, items, placeholder, prefix = "") {
  selectEl.innerHTML = `<option value="">${placeholder}</option>`;
  items.forEach(i => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = prefix + i;
    selectEl.appendChild(option);
  });
}

/**
 * Resetea todos los selects al índice 0.
 * @param {{ selectCliente, selectTecnico, selectTipoTurno, selectRango }} selects
 */
export function limpiarSelects({ selectCliente, selectTecnico, selectTipoTurno, selectRango }) {
  [selectCliente, selectTecnico, selectTipoTurno, selectRango].forEach(s => {
    if (s) s.selectedIndex = 0;
  });
}

// ============================================================
// Grilla de disponibilidad
// ============================================================

/**
 * Punto de entrada: renderiza las cards de turnos disponibles.
 *
 * @param {{
 *   clienteId:        string|number,
 *   tecnico:          Object,         // instancia Tecnico
 *   tSeleccionado:    string|number,  // T elegido
 *   rangoSeleccionado:"AM"|"PM",
 *   clientes:         Object[],
 *   turnos:           Object[],       // ViewModels actuales
 *   turnosContainer:  HTMLElement,
 *   guardarTurno:     Function,       // async (turnoUI) => ViewModel
 *   estadoTicket:     string,
 *   selects:          Object,
 * }} params
 */
export async function renderGrillaTurnos({
  clienteId,
  tecnico,
  tSeleccionado,
  rangoSeleccionado,
  clientes,
  turnos,
  turnosContainer,
  guardarTurno,
  estadoTicket,
  selects,
}) {
  turnosContainer.innerHTML = "";

  // Resolver cliente (local o Andros)
  let cliente;
  try {
    cliente = await resolverCliente(clientes, clienteId);
  } catch (e) {
    ToastService.error(e.message);
    return;
  }

  if (!tecnico) {
    ToastService.error("⚠️ No se encontró el técnico.");
    return;
  }

  const NumeroT = Number(tSeleccionado);

  const fechasOpciones = obtenerFechasDisponibles(
    tecnico,
    turnos,
    cliente.id ?? cliente.numero_cliente,
  );

  if (!fechasOpciones.length) {
    ToastService.error("No hay fechas disponibles según el técnico en los próximos 30 días");
    return;
  }

  fechasOpciones.forEach(opcion => {
    let horariosDisponibles = obtenerHorariosDisponibles(
      turnos,
      opcion.fechaISO,
      tecnico,
      opcion.diaNombre,
      cliente.id ?? cliente.numero_cliente,
      NumeroT,
    );

    horariosDisponibles = filtrarPorRango(horariosDisponibles, rangoSeleccionado, NumeroT);

    const card = _crearCardTurno({
      cliente,
      tecnico,
      NumeroT,
      rangoSeleccionado,
      opcion,
      horariosDisponibles,
      estadoTicket,
      guardarTurno,
      turnos,
      turnosContainer,
      selects,
    });

    turnosContainer.appendChild(card);
  });
}

// ----------------------------------------------------------
// Construcción del turno para enviar
// ----------------------------------------------------------

function _construirTurnoUI({ cliente, tecnico, fechaISO, horaInicio, NumeroT, rangoSeleccionado }) {
  if (!cliente?.id) throw new Error("cliente.id faltante");
  if (!tecnico?.id) throw new Error("tecnico.id faltante");

  return {
    cliente_id:    cliente.id,
    tecnico_id:    tecnico.id,
    fecha:         fechaISO,
    hora_inicio:   horaInicio,
    hora_fin:      TurnoModel.calcularHoraFin(horaInicio, NumeroT),
    estado:        "Abierto",
    tipo_turno:    Number(NumeroT),
    rango_horario: rangoSeleccionado,
    numero_ticket: TurnoModel.generarTicket(cliente.id),
  };
}

// ----------------------------------------------------------
// Card de turno
// ----------------------------------------------------------

function _crearCardTurno({
  cliente, tecnico, NumeroT, rangoSeleccionado, opcion,
  horariosDisponibles, estadoTicket, guardarTurno,
  turnos, turnosContainer, selects,
}) {
  const card    = document.createElement("div");
  card.className = "card-turno";

  const horaStr = horariosDisponibles.length ? horariosDisponibles[0] : "Sin horario";

  const fechaFormateada = opcion.fecha.toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const horarioGeneral = rangoSeleccionado === "AM" ? "09:00 - 13:00" : "14:00 - 18:00";

  card.innerHTML = `
    <h3 class="card-fecha-turno">Fecha: ${fechaFormateada}</h3>
    <p><strong>Cliente:</strong> ${cliente.numero_cliente} - ${cliente.nombre} ${cliente.apellido}</p>
    <p><strong>Técnico:</strong> ${tecnico.nombre} ${tecnico.apellido}</p>
    <p><strong>T:</strong> ${NumeroT}</p>
    <p><strong>Rango:</strong> ${rangoSeleccionado}</p>
    <p><strong>Horario General:</strong> ${horarioGeneral}</p>
    <p><strong>Horario Sugerido:</strong>
      ${horaStr !== "Sin horario" ? formatearRango(horaStr, NumeroT) : "Sin horario disponible"}
    </p>
    <p><strong>Estado del Ticket:</strong> ${estadoTicket}</p>
    <button class="btnSeleccionarTurno" ${horaStr === "Sin horario" ? "disabled" : ""}>
      Selección automática
    </button>
    <button class="btnEditarTurno">Selección Manual</button>
    <div class="editorHorario" style="display:none; margin-top:8px;"></div>
  `;

  _configurarSeleccionAutomatica(
    card, horaStr, opcion, cliente, tecnico,
    NumeroT, rangoSeleccionado, estadoTicket,
    guardarTurno, turnos, turnosContainer, selects,
  );

  _configurarSeleccionManual(
    card, horariosDisponibles, NumeroT, opcion, cliente, tecnico,
    rangoSeleccionado, estadoTicket, guardarTurno, turnos, turnosContainer, selects,
  );

  return card;
}

// ----------------------------------------------------------
// Selección automática
// ----------------------------------------------------------

function _configurarSeleccionAutomatica(
  card, horaStr, opcion, cliente, tecnico,
  NumeroT, rangoSeleccionado, estadoTicket,
  guardarTurno, turnos, turnosContainer, selects,
) {
  card.querySelector(".btnSeleccionarTurno")
    .addEventListener("click", async () => {
      if (horaStr === "Sin horario") { ToastService.error("No hay horarios disponibles"); return; }

      if (hayConflicto(
        turnos, opcion.fechaISO, horaStr,
        `${tecnico.nombre} ${tecnico.apellido}`,
        cliente.id ?? cliente.numero_cliente,
        NumeroT,
      )) {
        ToastService.error(card, "⚠️ Horario ocupado");
        return;
      }

      await _confirmarTurno({
        card, cliente, tecnico, fechaISO: opcion.fechaISO,
        horaInicio: horaStr, NumeroT, rangoSeleccionado, estadoTicket,
        guardarTurno, turnosContainer, selects, turnos
      });
    });
}

// ----------------------------------------------------------
// Selección manual
// ----------------------------------------------------------

function _configurarSeleccionManual(
  card, horariosDisponibles, NumeroT, opcion, cliente, tecnico,
  rangoSeleccionado, estadoTicket, guardarTurno, turnos, turnosContainer, selects,
) {
  const btnEditar = card.querySelector(".btnEditarTurno");
  const editor    = card.querySelector(".editorHorario");

  btnEditar.addEventListener("click", () => {
    editor.style.display = editor.style.display === "none" ? "block" : "none";
    editor.innerHTML     = "";

    if (editor.style.display !== "block") return;

    if (!horariosDisponibles.length) {
      editor.innerHTML = "<p>No hay horarios disponibles</p>";
      return;
    }

    const select = document.createElement("select");
    select.className = "select-horarios-manual";

    horariosDisponibles
      .map(hora => ({ label: formatearRango(hora, NumeroT), value: hora }))
      .forEach(({ label, value }) => {
        const opt = document.createElement("option");
        opt.value = value;
        opt.textContent = label;
        select.appendChild(opt);
      });

    const btnConfirmar = document.createElement("button");
    btnConfirmar.textContent = "Confirmar";
    btnConfirmar.className   = "btnConfirmarManual";

    btnConfirmar.onclick = async () => {
      const horaInicio = select.value;

      if (hayConflicto(
        turnos, opcion.fechaISO, horaInicio,
        `${tecnico.nombre} ${tecnico.apellido}`,
        cliente.id ?? cliente.numero_cliente,
        NumeroT,
      )) {
        ToastService.error(card, "⚠️ Horario ocupado");
        return;
      }

      await _confirmarTurno({
        card, cliente, tecnico, fechaISO: opcion.fechaISO,
        horaInicio, NumeroT, rangoSeleccionado, estadoTicket,
        guardarTurno, turnosContainer, selects, turnos
      });
    };

    editor.appendChild(select);
    editor.appendChild(btnConfirmar);
  });
}

// ----------------------------------------------------------
// Confirmar turno (compartido por auto y manual)
// ----------------------------------------------------------

async function _confirmarTurno({
  card, cliente, tecnico, fechaISO, horaInicio,
  NumeroT, rangoSeleccionado, estadoTicket,
  guardarTurno, turnosContainer, selects,turnos
}) {

  if (clienteYaTieneTurno(cliente.id ?? cliente.numero_cliente, turnos)) {
    ToastService.error(card, "⚠️ Este cliente ya tiene un turno activo", "error");
    return;
  }
  
  try {
    const turnoUI = _construirTurnoUI({
      cliente, tecnico, fechaISO, horaInicio, NumeroT, rangoSeleccionado,
    });

    const nuevoTurno = await guardarTurno(turnoUI);

    const historialContainer = document.getElementById("historialTurnos");
    if (historialContainer) {
      agregarTurnoAlHistorial(nuevoTurno, historialContainer);
    }

    turnosContainer.innerHTML = "";
    ToastService.error(card, "✅ Turno creado", "ok");
    limpiarSelects(selects);

  } catch (error) {
    ToastService.error(card, error.message);
  }
}
