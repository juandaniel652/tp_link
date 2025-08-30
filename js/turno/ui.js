// ui.js
import { turnos, clientes, tecnicos, guardarTurnos } from "./state.js";
import { generarHorasDisponibles, actualizarClientesDisponibles } from "./helpers.js";

const turnosContainer = document.getElementById("turnosContainer");
const selectCliente = document.getElementById("selectCliente");
const selectTecnico = document.getElementById("selectTecnico");
const selectT = document.getElementById("selectT");
const selectRango = document.getElementById("selectRango");
const selectEstadoTicket = document.getElementById("selectEstadoTicket");
const formTurno = document.getElementById("formTurno");

export function mostrarAlerta(mensaje, tipo = "info") {
  const alertaPrevia = document.querySelector(".mensaje");
  if (alertaPrevia) alertaPrevia.remove();

  const alerta = document.createElement("div");
  alerta.className = `mensaje ${tipo}`;
  alerta.textContent = mensaje;
  formTurno.prepend(alerta);

  setTimeout(() => alerta.remove(), 3500);
}

export function renderTurnos() {
  turnosContainer.innerHTML = "";
  if (turnos.length === 0) {
    turnosContainer.innerHTML = `<p>No hay turnos registrados</p>`;
    return;
  }

  turnos.forEach((t, index) => {
    const card = document.createElement("div");
    card.classList.add("tarjeta-turno");
    card.innerHTML = `
      <h3>📅 ${t.fecha} - ⏰ ${t.hora}</h3>
      <p><strong>Cliente:</strong> ${t.cliente}</p>
      <p><strong>Técnico:</strong> ${t.tecnico}</p>
      <p><strong>T:</strong> ${t.t}</p>
      <p><strong>Rango:</strong> ${t.rango}</p>
      <span class="turno-estado confirmado">${t.estado}</span>
      <br><br>
      <button data-index="${index}" class="btn-eliminar">Eliminar</button>
    `;
    turnosContainer.appendChild(card);
  });

  document.querySelectorAll(".btn-eliminar").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = e.target.dataset.index;
      turnos.splice(idx, 1);
      guardarTurnos();
      renderTurnos();
      generarHorasDisponibles();
      actualizarClientesDisponibles();
      mostrarAlerta("✅ Turno eliminado.", "success");
    });
  });
}

export function renderTecnicos() {
  selectTecnico.innerHTML = "<option value=''>Seleccione técnico</option>";
  tecnicos.forEach((t) => {
    const option = document.createElement("option");
    option.value = t.nombre;
    option.textContent = `${t.nombre}${t.especialidad ? " (" + t.especialidad + ")" : ""}`;
    selectTecnico.appendChild(option);
  });
}

export function renderClientes() {
  selectCliente.innerHTML = "<option value=''>Seleccione cliente</option>";
  clientes.forEach((c) => {
    const option = document.createElement("option");
    option.value = `${c.numeroCliente} - ${c.nombre} ${c.apellido}`;
    option.textContent = option.value;
    selectCliente.appendChild(option);
  });
}

export function renderT() {
  selectT.innerHTML = "<option value=''>Seleccionar T</option>";
  for (let i = 1; i <= 6; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `T${i} (${i * 15} min)`;
    selectT.appendChild(option);
  }
}

export function renderRango() {
  selectRango.innerHTML = "<option value=''>Seleccionar Rango</option>";
  ["AM", "PM"].forEach((rango) => {
    const option = document.createElement("option");
    option.value = rango;
    option.textContent = rango;
    selectRango.appendChild(option);
  });
}

export function renderEstadoTicket(){
  selectEstadoTicket.innerHTML = "<option value=''>Seleccionar Estado del Ticket</option>";
  ["Abierto", "En Progreso", "Cerrado"].forEach((estado) => {
    const option = document.createElement("option");
    option.value = estado;
    option.textContent = estado;
    selectEstadoTicket.appendChild(option);
  });
}
