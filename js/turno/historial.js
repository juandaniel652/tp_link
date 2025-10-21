import { formatearRango } from "./formateo.js";
import { saveData } from "./storage.js";

export function renderHistorialTurnos(turnos, turnosContainer, actualizarSelectClientes) {
  // Obtener o crear contenedor de historial
  let historial = document.getElementById("historialTurnos");
  if (!historial) {
    historial = document.createElement("div");
    historial.id = "historialTurnos";
    turnosContainer.appendChild(historial);
  }

  historial.innerHTML = "<h2>Historial de Turnos</h2>";

  if (!turnos.length) {
    historial.innerHTML += `<p style="text-align:center;color:#555;">No hay turnos registrados.</p>`;
    if (actualizarSelectClientes) actualizarSelectClientes(turnos);
    return;
  }

  // Ordenar por fecha
  const turnosOrdenados = [...turnos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  // Renderizar cada turno
  turnosOrdenados.forEach(t => {
    const card = document.createElement("div");
    card.className = "card-turno";
    card.innerHTML = `
      <h3>${t.fechaStr || t.fecha}</h3>
      <p><strong>Cliente:</strong> ${t.id_cliente || "N/A"} - ${t.cliente || "Sin nombre"}</p>
      <p><strong>Técnico:</strong> ${t.tecnico || (t.tecnicos && t.tecnicos.join(", ")) || "Sin técnico"}</p>
      <p><strong>T:</strong> ${t.t || "N/A"}</p>
      <p><strong>Rango:</strong> ${t.rango_horario || "N/A"}</p>
      <p><strong>Horario General:</strong> ${
        t.rango_horario === "AM" ? "09:00 - 13:00" :
        t.rango_horario === "PM" ? "14:00 - 18:00" :
        "No definido"
      }</p>
      <p><strong>Horario:</strong> ${t.hora ? formatearRango(t.hora, t.t) : "N/A"}</p>
      <p><strong>Estado del Ticket:</strong> ${t.estado || "N/A"}</p>
      <button class="btnEliminarTurno" data-id="${t.ticket_id}">❌ Eliminar</button>
    `;
    historial.appendChild(card);
  });

  // Eventos para eliminar turno
  document.querySelectorAll(".btnEliminarTurno").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      const nuevosTurnos = turnos.filter(t => String(t.ticket_id) !== String(id));
      saveData("turnos", nuevosTurnos);

      // Re-render del historial con callback para actualizar select
      renderHistorialTurnos(nuevosTurnos, turnosContainer, actualizarSelectClientes);
    });
  });

  // Actualizar select de clientes al final
  if (actualizarSelectClientes) actualizarSelectClientes(turnos);
}
