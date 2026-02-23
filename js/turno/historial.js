import { formatearRango } from "./formateo.js";
import { TURNOS_URL, obtenerTurnosPorFecha } from "./apiTurnos.js";

function formatearFechaLarga(fechaISO){

  const fecha =
    new Date(fechaISO);

  return fecha.toLocaleDateString(
    "es-AR",
    {
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  );

}

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


export function renderHistorialTurnos(turnos, container){

  // VALIDACIÓN
  if(!container){
    console.error("container no definido");
    return;
  }

  // LIMPIAR CONTENEDOR
  container.innerHTML = "";


  // SIN TURNOS
  if(!turnos || turnos.length === 0){

    container.innerHTML =
      "<p>No hay turnos para esta fecha</p>";

    return;

  }


  // ============================
  // TITULO FECHA
  // ============================

  const fecha =
    new Date(turnos[0].fecha);

  const fechaFormateada =
    fecha.toLocaleDateString(
      "es-AR",
      {
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    );


  // ============================
  // CARDS
  // ============================

  turnos.forEach(t => {

    const card =
      document.createElement("div");

    card.className =
      "card-turno";


    card.innerHTML = `
      <h3 class="card-fecha-turno">
      ${fechaFormateada}
      </h3>

      <p><strong>Ticket:</strong>
        ${t.numero_ticket}
      </p>

      <p><strong>Cliente:</strong>
        ${t.cliente.numero_cliente}
        - ${t.cliente.nombre}
      </p>

      <p><strong>Técnico:</strong>
        ${t.tecnico.nombre}
      </p>

      <p><strong>Horario:</strong>
        ${t.hora_inicio}
        - ${t.hora_fin}
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


    container.appendChild(card);

  });

}

export function agregarTurnoAlHistorial(turno, container){

  const card =
    document.createElement("div");

  card.className =
    "card-turno";

  card.innerHTML = `
    <p><strong>Ticket:</strong>
      ${turno.numero_ticket}
    </p>

    <p><strong>Cliente:</strong>
      ${turno.cliente.numero_cliente}
      - ${turno.cliente.nombre}
    </p>

    <p><strong>Técnico:</strong>
      ${turno.tecnico.nombre}
    </p>

    <p><strong>Horario:</strong>
      ${turno.hora_inicio}
      - ${turno.hora_fin}
    </p>

    <p><strong>Estado:</strong>
      ${turno.estado}
    </p>

    <button
      class="btnEliminarTurno"
      data-id="${turno.id}">
      Eliminar
    </button>
  `;


  // insertar arriba
  container.appendChild(card);

}