import { formatearRango } from "./formateo.js";
import { TURNOS_URL, obtenerTurnosPorFecha } from "./apiTurnos.js";

export async function inicializarHistorial(turnosContainer){

    const selector = document.getElementById("selectorFecha");

    selector.addEventListener("change", async () => {

        const fecha = selector.value;

        const turnos = await obtenerTurnosPorFecha(fecha);

        renderHistorialTurnos(turnos, turnosContainer);

    });

}

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

  // VALIDACIÓN DEFENSIVA
  if (!turnosContainer) {
    console.error("turnosContainer no existe");
    return;
  }

  // LIMPIAR SIEMPRE (clave del UI state correcto)
  turnosContainer.innerHTML = "";

  // SIN TURNOS
  if (!turnos || turnos.length === 0) {

    turnosContainer.innerHTML = `
      <p class="historial-vacio">
        No hay turnos para esta fecha
      </p>
    `;

    return;
  }

  // RENDER
  turnos.forEach(t => {

    const card = document.createElement("div");

    card.className = "card-turno";

    card.innerHTML = `
      <p><strong>Ticket:</strong> ${t.numero_ticket}</p>

      <p><strong>Cliente:</strong>
        ${t.cliente.numero_cliente} - ${t.cliente.nombre}
      </p>

      <p><strong>Técnico:</strong>
        ${t.tecnico.nombre}
      </p>

      <p><strong>Fecha:</strong>
        ${t.fecha}
      </p>

      <p><strong>Horario:</strong>
        ${t.hora_inicio} - ${t.hora_fin}
      </p>

      <p><strong>Estado:</strong>
        ${t.estado}
      </p>

      <button
        class="btnEliminarTurno"
        data-id="${t.id}">
        Eliminar
      </button>
    `;

    turnosContainer.appendChild(card);

  });

  // EVENTOS
  turnosContainer
    .querySelectorAll(".btnEliminarTurno")
    .forEach(btn => {

      btn.onclick = async () => {

        const id = btn.dataset.id;

        await eliminarTurnoBackend(id);

        const selector =
          document.getElementById("selectorFecha");

        const fecha = selector.value;

        const nuevos =
          await obtenerTurnosPorFecha(fecha);

        renderHistorialTurnos(
          nuevos,
          turnosContainer
        );

      };

    });

}