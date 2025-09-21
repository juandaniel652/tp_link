// Funciones para renderizar historial
// Muestra el historial según los datos del formateo y lo guardado en el localStorage

import { formatearRango } from "./formateo.js";
import { saveData } from "./storage.js";

export function renderHistorialTurnos(turnos, turnosContainer) {
  let historial = document.getElementById("historialTurnos");
  if (!historial) {
    historial = document.createElement("div");
    historial.id = "historialTurnos";
    turnosContainer.appendChild(historial);
  }
  historial.innerHTML = "<h2>Historial de Turnos</h2>";

  if (!turnos.length) {
    historial.innerHTML += `<p style="text-align:center;color:#555;">No hay turnos registrados.</p>`;
    return;
  }

  const turnosOrdenados = [...turnos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  turnosOrdenados.forEach(t => {
    const card = document.createElement("div");
    card.className = "card-turno";
    card.innerHTML = `
      <h3>${t.fechaStr || t.fecha}</h3>
      <p><strong>Cliente:</strong> ${t.clienteId} - ${t.cliente}</p>
      <p><strong>Técnico:</strong> ${t.tecnico || (t.tecnicos && t.tecnicos.join(", "))}</p>
      <p><strong>T:</strong> ${t.t}</p>
      <p><strong>Rango:</strong> ${t.rango}</p>
      <p><strong>Horario:</strong> ${formatearRango(t.hora, t.t)}</p>
      <button class="btnEliminarTurno" data-id="${t.id}">❌ Eliminar</button>
    `;
    historial.appendChild(card);
  });

  document.querySelectorAll(".btnEliminarTurno").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      const nuevosTurnos = turnos.filter(t => String(t.id) !== String(id));
      saveData("turnos", nuevosTurnos);
      renderHistorialTurnos(nuevosTurnos, turnosContainer);
    });
  });
}
