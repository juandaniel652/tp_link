import { formatearRango } from "./formateo.js";
import { TURNOS_URL } from "./apiTurnos.js";

export async function obtenerTurnosBackend() {

    const response = await fetch(TURNOS_URL);

    if (!response.ok)
        throw new Error("Error obteniendo turnos");


    return await response.json();
}

export async function eliminarTurnoBackend(id) {

    const response = await fetch(`${TURNOS_URL}${id}`, {


        method: "DELETE"
    });

    if (!response.ok)
        throw new Error("Error eliminando turno");

    return true;
}


export function renderHistorialTurnos(turnos, turnosContainer) {

  let historial = document.getElementById("historialTurnos");

  if (!historial) {

    historial = document.createElement("div");

    historial.id = "historialTurnos";

    turnosContainer.appendChild(historial);

  }

  historial.innerHTML = "<h2>Historial de Turnos</h2>";


  if (!turnos.length) {

    historial.innerHTML += "<p>No hay turnos registrados</p>";

    return;

  }


  turnos.forEach(t => {

    const card = document.createElement("div");

    card.className = "card-turno";

    card.innerHTML = `
      <p><strong>Ticket:</strong> ${t.numero_ticket}</p>

     <p><strong>Cliente:</strong> ${t.cliente.numero_cliente} - ${t.cliente.nombre}</p>

      <p><strong>Técnico:</strong> ${t.tecnico.nombre}</p>

      <p><strong>Fecha:</strong> ${t.fecha}</p>

      <p><strong>Horario:</strong> ${t.hora_inicio} - ${t.hora_fin}</p>

      <p><strong>Estado:</strong> ${t.estado}</p>

      <button class="btnEliminarTurno" data-id="${t.id}">
        Eliminar
      </button>
    `;

    historial.appendChild(card);

  });


  document.querySelectorAll(".btnEliminarTurno")

  .forEach(btn => {

    btn.onclick = async () => {

      const id = btn.dataset.id;

      await eliminarTurnoBackend(id);

      const nuevos = await obtenerTurnosBackend();

      renderHistorialTurnos(nuevos, turnosContainer);

    };

  });

}

