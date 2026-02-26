import { cancelarTurno } from "../service/turnos.api.js";
import { crearFechaLocalDesdeISO } from "../mappers/turnos.mapper.js";

export function renderHistorialTurnos(turnos, container) {
  if (!container) {
    console.error("container no definido");
    return;
  }

  container.innerHTML = "";

  if (!turnos || turnos.length === 0) {
    container.innerHTML = "<p>No hay turnos para esta fecha</p>";
    return;
  }

  turnos.forEach(t => {
    const fecha = crearFechaLocalDesdeISO(t.fecha);

    const fechaFormateada = fecha.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    const card = document.createElement("div");
    card.className = "card-turno";

    card.innerHTML = `
      <h3 class="card-fecha-turno">${fechaFormateada}</h3>

      <p><strong>Ticket:</strong> ${t.numero_ticket}</p>

      <p><strong>Cliente:</strong>
        ${t.cliente.numero_cliente} - ${t.cliente.nombre}
      </p>

      <p><strong>Técnico:</strong>
        ${t.tecnico.nombre}
      </p>

      <p><strong>Tipo Turno:</strong> T${t.tipo_turno}</p>

      <p><strong>Rango Horario:</strong> ${t.rango_horario}</p>

      <p><strong>Horario:</strong>
        ${t.hora_inicio} - ${t.hora_fin}
      </p>

      <p><strong>Estado:</strong> ${t.estado}</p>

      <button class="btnEliminarTurno" data-id="${t.id}">
        Eliminar
      </button>
    `;

    container.appendChild(card);

    const btnEliminar = card.querySelector(".btnEliminarTurno");

    btnEliminar.addEventListener("click", async () => {
      const id = btnEliminar.dataset.id;

      try {
        await cancelarTurno(id);
        card.remove();
      } catch (e) {
        console.error(e);
      }
    });
  });
}

export function agregarTurnoAlHistorial(turno, container) {
  const card = document.createElement("div");
  card.className = "card-turno";

  card.innerHTML = `
    <p><strong>Ticket:</strong> ${turno.numero_ticket}</p>

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

    <button class="btnEliminarTurno" data-id="${turno.id}">
      Eliminar
    </button>
  `;

  container.prepend(card);
}