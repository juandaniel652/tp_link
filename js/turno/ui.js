// ui.js
import { turnos, clientes, tecnicos, guardarTurnos, naps } from "./state.js";
import { generarHorasDisponibles, actualizarClientesDisponibles } from "./helpers.js";

/* ==========  
 * Helpers DOM  
 * ========== */
const $ = (id) => document.getElementById(id);
const els = () => ({
  turnosContainer: $("turnosContainer"),
  selectCliente: $("selectCliente"),
  selectTecnico: $("selectTecnico"),
  selectNap: $("selectNap"),
  selectT: $("selectT"),
  selectRango: $("selectRango"),
  selectEstadoTicket: $("selectEstadoTicket"),
  formTurno: $("formTurno"),
  turnoFecha: $("turnoFecha"),
  turnoHora: $("turnoHora"),
  btnManual: $("btnManual"),
});

/* =========================
 * UI: Alertas y Etiquetas
 * ========================= */
export function mostrarAlerta(mensaje, tipo = "info") {
  const { formTurno } = els();
  if (!formTurno) return;

  const alertaPrevia = document.querySelector(".mensaje");
  if (alertaPrevia) alertaPrevia.remove();

  const alerta = document.createElement("div");
  alerta.className = `mensaje ${tipo}`;
  alerta.textContent = mensaje;
  formTurno.prepend(alerta);

  setTimeout(() => alerta.remove(), 3500);
}

function normalizarEstadoInput(value) {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  if (v === "ok" || v === "confirmado") return "Confirmado";
  if (v === "nok" || v === "rechazado") return "Rechazado";
  if (v === "repro" || v === "reprogramado" || v === "reprogramar") return "Reprogramado";
  return null;
}

function estadoClase(estado) {
  return (estado || "").toLowerCase().replace(/\s+/g, "-");
}

export function renderEtiquetaEstado(estado) {
  switch (estado) {
    case "Confirmado":
      return "✅ OK";
    case "Rechazado":
      return "❌ NOK";
    case "Reprogramado":
      return "🔄 Repro";
    default:
      return estado || "—";
  }
}

/* =========================
 * UI: Render de listados
 * ========================= */
export function renderTurnos() {
  const { turnosContainer } = els();
  if (!turnosContainer) return;

  turnosContainer.innerHTML = "";
  if (turnos.length === 0) {
    turnosContainer.innerHTML = `<p>No hay turnos registrados</p>`;
    return;
  }

  const frag = document.createDocumentFragment();

  turnos.forEach((t, index) => {
    const card = document.createElement("div");
    card.classList.add("tarjeta-turno");
    card.innerHTML = `
      <h3>📅 ${t.fecha || t.dia} - ⏰ ${t.hora || t.rango}</h3>
      <p><strong>Cliente:</strong> ${t.cliente}</p>
      <p><strong>Técnico:</strong> ${t.tecnico}</p>
      <p><strong>T:</strong> ${t.t}</p>
      <p><strong>Punto de Acceso:</strong> ${t.nap}</p>
      <p><strong>Rango:</strong> ${t.rango || "—"}</p>
      <span class="turno-estado ${estadoClase(t.estado)}">${renderEtiquetaEstado(t.estado)}</span>
      <br><br>
      <button data-index="${index}" class="btn-estado">Editar Estado</button>
      <button data-index="${index}" class="btn-eliminar">Eliminar</button>
    `;
    frag.appendChild(card);
  });

  turnosContainer.appendChild(frag);

  bindTurnosContainerEvents();
}

export function renderTecnicos() {
  const { selectTecnico } = els();
  if (!selectTecnico) return;

  selectTecnico.innerHTML = "<option value=''>Seleccione técnico</option>";
  tecnicos.forEach((t) => {
    const option = document.createElement("option");
    option.value = t.nombre;
    option.textContent = `${t.nombre}${t.especialidad ? " (" + t.especialidad + ")" : ""}`;
    selectTecnico.appendChild(option);
  });
}

export function renderClientes() {
  const { selectCliente } = els();
  if (!selectCliente) return;

  selectCliente.innerHTML = "<option value=''>Seleccione cliente</option>";
  clientes.forEach((c) => {
    const option = document.createElement("option");
    option.value = `${c.numeroCliente} - ${c.nombre} ${c.apellido}`;
    option.textContent = option.value;
    selectCliente.appendChild(option);
  });
}

export function renderT() {
  const { selectT } = els();
  if (!selectT) return;

  selectT.innerHTML = "<option value=''>Seleccionar T</option>";
  for (let i = 1; i <= 6; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `T${i} (${i * 15} min)`;
    selectT.appendChild(option);
  }
}

/* ==============================
 * Render horarios según NAP (con bloques y validación)
 * ============================== */
export function renderHorariosNap(napNumero) {
  const { selectRango } = els();
  if (!selectRango) return;

  const nap = naps.find((n) => n.numero == napNumero);
  if (!nap) return;

  selectRango.innerHTML = "<option value=''>Seleccionar Horario</option>";

  // Para cada horario del NAP
  nap.horarios.forEach((h) => {
    // h.dia = 'Lunes', h.rango = '08:00 AM' etc.
    const ocupado = turnos.some(
      (t) => t.nap == nap.numero && t.dia == h.dia && t.rango == h.rango
    );

    const option = document.createElement("option");
    option.value = `${h.dia}-${h.rango}`; // ej: Lunes-08:00
    option.textContent = `${h.dia} - ${h.rango}${ocupado ? " (Ocupado)" : ""}`;
    if (ocupado) option.disabled = true;
    selectRango.appendChild(option);
  });
}


// util: convertir bloque → hora
function bloqueToHora(b) {
  const inicio = 8 * 60; // arranca 08:00
  const minutos = inicio + b * 15;
  const hh = String(Math.floor(minutos / 60)).padStart(2, "0");
  const mm = String(minutos % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

/* ==============================
 * Guardar turno desde formulario
 * ============================== */
export function guardarTurnoDesdeForm() {
  const { selectCliente, selectTecnico, selectNap, selectRango, selectT } = els();

  if (!selectCliente.value || !selectTecnico.value || !selectNap.value || !selectRango.value || !selectT.value) {
    mostrarAlerta("⚠️ Complete todos los campos", "error");
    return;
  }

  const [dia, rango] = selectRango.value.split("-");

  // validar que no esté ocupado
  const ocupado = turnos.some(
    (t) => t.nap == selectNap.value && t.dia == dia && t.rango == rango
  );

  if (ocupado) {
    mostrarAlerta("❌ Ese horario ya está ocupado", "error");
    return;
  }

  const nuevoTurno = {
    cliente: selectCliente.value,
    tecnico: selectTecnico.value,
    nap: selectNap.value,
    dia,
    rango,
    t: parseInt(selectT.value, 10),
    estado: "Confirmado",
  };

  turnos.push(nuevoTurno);
  guardarTurnos();
  renderTurnos();
  mostrarAlerta("✅ Turno guardado con éxito", "success");

  // volver a renderizar horarios disponibles
  renderHorariosNap(selectNap.value);
}


/* ==============================
 * Render de estados
 * ============================== */
export function renderEstadoTicket() {
  const { selectEstadoTicket } = els();
  if (!selectEstadoTicket) return;

  selectEstadoTicket.innerHTML = "<option value=''>Seleccionar Estado del Ticket</option>";
  ["Abierto", "En Progreso", "Cerrado"].forEach((estado) => {
    const option = document.createElement("option");
    option.value = estado;
    option.textContent = estado;
    selectEstadoTicket.appendChild(option);
  });
}

/* ======================================
 * Modal moderno para editar estado
 * ====================================== */
const modalContainer = document.createElement("div");
modalContainer.id = "modalEstado";
modalContainer.innerHTML = `
  <div>
    <h3>Editar Estado del Turno</h3>
    <select id="modalSelectEstado">
      <option value="">Seleccionar Estado</option>
      <option value="Confirmado">✅ Confirmado</option>
      <option value="Rechazado">❌ Rechazado</option>
      <option value="Reprogramado">🔄 Reprogramado</option>
    </select>
    <div style="text-align: right; margin-top: 15px;">
      <button id="modalCancelar">Cancelar</button>
      <button id="modalGuardar">Guardar</button>
    </div>
  </div>
`;
document.body.appendChild(modalContainer);

let editingIndex = null;

function abrirModalEstado(idx) {
  editingIndex = idx;
  const modalSelect = document.getElementById("modalSelectEstado");
  modalSelect.value = turnos[idx]?.estado || "";
  modalContainer.classList.add("show");
}

function cerrarModalEstado() {
  modalContainer.classList.remove("show");
  editingIndex = null;
}

document.getElementById("modalCancelar").addEventListener("click", cerrarModalEstado);
document.getElementById("modalGuardar").addEventListener("click", () => {
  if (editingIndex == null) return;
  const nuevo = document.getElementById("modalSelectEstado").value;
  if (!nuevo) {
    mostrarAlerta("⚠️ Selecciona un estado válido.", "error");
    return;
  }
  turnos[editingIndex].estado = nuevo;
  guardarTurnos();
  renderTurnos();
  mostrarAlerta("✅ Estado actualizado.", "success");
  cerrarModalEstado();
});

/* ======================================
 * Delegación de eventos en las tarjetas
 * ====================================== */
function bindTurnosContainerEvents() {
  const { turnosContainer } = els();
  if (!turnosContainer) return;

  turnosContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const idx = btn.dataset.index;
    if (idx == null) return;

    if (btn.classList.contains("btn-eliminar")) {
      turnos.splice(idx, 1);
      guardarTurnos();
      renderTurnos();
      generarHorasDisponibles();
      actualizarClientesDisponibles();
      mostrarAlerta("✅ Turno eliminado.", "success");
      return;
    }

    if (btn.classList.contains("btn-estado")) {
      abrirModalEstado(idx);
      return;
    }
  });
}

/* =========================
 * Render NAPs + listener
 * ========================= */
export function renderNaps() {
  const { selectNap } = els();
  if (!selectNap) return;

  selectNap.innerHTML = "<option value=''>Seleccionar Punto de Acceso</option>";

  naps.forEach((nap) => {
    const option = document.createElement("option");
    option.value = nap.numero;
    option.textContent = `NAP ${nap.numero}`;
    selectNap.appendChild(option);
  });

  // Cuando cambia el NAP, renderiza los horarios disponibles
  selectNap.addEventListener("change", (e) => {
    const napNumero = e.target.value;
    if (napNumero) {
      renderHorariosNap(napNumero);
    }
  });
}

/* ==============================
 * Render rango (manual, opcional)
 * ============================== */
export function renderRango() {
  const { selectRango } = els();
  if (!selectRango) return;

  selectRango.innerHTML = "<option value=''>Seleccionar Rango</option>";
  ["AM", "PM"].forEach((rango) => {
    const option = document.createElement("option");
    option.value = rango;
    option.textContent = rango;
    selectRango.appendChild(option);
  });
}

/* ==============================
 * NUEVO: activar botón manual
 * ============================== */
export function activarBotonManual() {
  const { btnManual, turnoFecha, turnoHora } = els();
  if (!btnManual || !turnoFecha || !turnoHora) return;

  // ocultar fecha/hora al inicio
  turnoFecha.style.display = "none";
  turnoHora.style.display = "none";
  document.querySelector("label[for='turnoFecha']").style.display = "none";
  document.querySelector("label[for='turnoHora']").style.display = "none";

  btnManual.addEventListener("click", () => {
    const visible = turnoFecha.style.display === "block";
    turnoFecha.style.display = visible ? "none" : "block";
    turnoHora.style.display = visible ? "none" : "block";
    document.querySelector("label[for='turnoFecha']").style.display = visible ? "none" : "block";
    document.querySelector("label[for='turnoHora']").style.display = visible ? "none" : "block";
  });
}