import { DAYS, NOMBRES_DIAS } from "./constantes.js";
import { formatearRango } from "./formateo.js";
import { hayConflicto, obtenerHorariosDisponibles } from "./validaciones.js";

// Genera opciones de horario según T y bloques
function generarOpcionesHorarios(tNum, bloques) {
  return bloques.map(bloque => formatearRango(bloque, tNum));
}

export function renderGrillaTurnos({
  clienteId,
  tecnico,          // 👈 objeto Técnico
  tSeleccionado,
  rangoSeleccionado,
  clientes,
  turnos,
  turnosContainer,
  guardarTurno,      // 👈 función centralizada de principal.js
  estadoTicket
}) {
  turnosContainer.innerHTML = "";

  // ======================
  // Búsqueda de existencia de cliente y de técnico
  // ======================
  const cliente = clientes.find(c => String(c.numeroCliente) === String(clienteId));
  if (!cliente || !tecnico) return alert("Cliente o Técnico no encontrado");

  const NumeroT = Number(tSeleccionado);

  // ======================
  // Validación de días disponibles
  // ======================
  let diasDisponibles = tecnico.getDiasDisponibles();
  diasDisponibles = diasDisponibles.map(d => d.toLowerCase());

  const hoy = new Date();
  const fechasOpciones = [];
  let iterFecha = new Date(hoy);

  let contador = 0;
  const iteradorDias = 30;

  while (fechasOpciones.length < 3 && contador < iteradorDias) {
    iterFecha.setDate(iterFecha.getDate() + 1);
    const fechaLocal = new Date(iterFecha.getFullYear(), iterFecha.getMonth(), iterFecha.getDate());
    const diaNombre = DAYS[fechaLocal.getDay()]; // ya está en minúscula

    if (!diasDisponibles.includes(diaNombre)) {
      contador++;
      continue;
    }

    const fechaISO = `${fechaLocal.getFullYear()}-${String(fechaLocal.getMonth() + 1).padStart(2,"0")}-${String(fechaLocal.getDate()).padStart(2,"0")}`;

    // Verificar si el cliente ya tiene turno ese día
    const conflictoCliente = turnos.some(turno =>
      String(turno.clienteId) === String(cliente.numeroCliente) &&
      turno.fecha === fechaISO
    );

    if (!conflictoCliente) {
      fechasOpciones.push({ fecha: fechaLocal, fechaISO, diaNombre });
    }

    contador++;
  }

  if (!fechasOpciones.length) {
    return alert("No hay fechas disponibles según el técnico en los próximos 30 días");
  }

  fechasOpciones.forEach(opcion => {
    const card = document.createElement("div");
    card.className = "card-turno";

    // 🔹 Horarios disponibles
    let horariosDisponibles = obtenerHorariosDisponibles(turnos, opcion.fechaISO, tecnico, opcion.diaNombre);
    horariosDisponibles = filtrarPorRango(horariosDisponibles, rangoSeleccionado, NumeroT);

    const horaStr = horariosDisponibles.length ? horariosDisponibles[0] : "Sin horario";

    card.innerHTML = `
      <h3>${NOMBRES_DIAS[opcion.diaNombre]} ${opcion.fecha.toLocaleDateString("es-ES",{day:"numeric", month:"long"})}</h3>
      <p><strong>Cliente:</strong> ${cliente.numeroCliente} - ${cliente.nombre} ${cliente.apellido}</p>
      <p><strong>Técnico:</strong> ${tecnico.nombre} ${tecnico.apellido}</p>
      <p><strong>T:</strong> ${NumeroT}</p>
      <p><strong>Rango:</strong> ${rangoSeleccionado}</p>
      <p><strong>Horario General:</strong> ${rangoSeleccionado == "AM" ? "09:00 - 13:00" : "14:00 - 18:00"}</p>
      <p><strong>Horario Sugerido:</strong> ${horaStr !== "Sin horario" ? formatearRango(horaStr, NumeroT) : "Sin horario disponible"}</p>
      <p><strong>Estado del Ticket:</strong> ${estadoTicket}</p>
      <button class="btnSeleccionarTurno" ${horaStr === "Sin horario" ? "disabled" : ""}>Selección automática</button>
      <button class="btnEditarTurno">Selección Manual</button>
      <div class="editorHorario" style="display:none; margin-top:8px;"></div>
    `;

    // ======================
    // SELECCIÓN AUTOMÁTICA
    // ======================
    card.querySelector(".btnSeleccionarTurno").addEventListener("click", () => {
      if (horaStr === "Sin horario") return alert("No hay horarios disponibles para este día");

      if (hayConflicto(turnos, opcion.fechaISO, horaStr, `${tecnico.nombre} ${tecnico.apellido}`)) {
        mostrarMensaje(card, "⚠️ Ese horario ya está ocupado para este técnico.");
        return;
      }

      const nuevoTurno = {
        id: Date.now(),
        clienteId: cliente.numeroCliente,
        cliente: `${cliente.nombre} ${cliente.apellido}`.trim(),
        tecnico: `${tecnico.nombre} ${tecnico.apellido}`,
        t: NumeroT,
        rango: rangoSeleccionado,
        fecha: opcion.fechaISO,
        fechaStr: `${NOMBRES_DIAS[opcion.diaNombre]} ${opcion.fecha.toLocaleDateString("es-ES",{day:"numeric", month:"long"})}`,
        hora: horaStr,
        estadoTicket: estadoTicket  // 👈 incluir estado del ticket
      };

      guardarTurno(nuevoTurno);  // 👈 usa la función central
      turnosContainer.innerHTML = "";
    });

    // ======================
    // SELECCIÓN MANUAL
    // ======================
    card.querySelector(".btnEditarTurno").addEventListener("click", () => {
      const editor = card.querySelector(".editorHorario");
      editor.style.display = editor.style.display === "none" ? "block" : "none";
      editor.innerHTML = "";

      if (editor.style.display === "block") {
        const select = document.createElement("select");
        select.className = "form-turno-select";

        if (!horariosDisponibles.length) {
          editor.innerHTML = "<p>No hay horarios disponibles</p>";
          return;
        }

        generarOpcionesHorarios(NumeroT, horariosDisponibles).forEach(opt => {
          const option = document.createElement("option");
          option.value = opt;
          option.textContent = opt;
          select.appendChild(option);
        });

        const btnAceptar = document.createElement("button");
        btnAceptar.textContent = "Aceptar horario manual";
        btnAceptar.className = "btn-primary";
        btnAceptar.addEventListener("click", () => {
          const horarioSeleccionado = select.value.split(" ")[0];

          if (hayConflicto(turnos, opcion.fechaISO, horarioSeleccionado, `${tecnico.nombre} ${tecnico.apellido}`)) {
            mostrarMensaje(card, "⚠️ Ese horario ya está ocupado para este técnico.");
            return;
          }

          const nuevoTurno = {
            id: Date.now(),
            clienteId: cliente.numeroCliente,
            cliente: `${cliente.nombre} ${cliente.apellido}`.trim(),
            tecnico: `${tecnico.nombre} ${tecnico.apellido}`,
            t: NumeroT,
            rango: rangoSeleccionado,
            fecha: opcion.fechaISO,
            fechaStr: `${NOMBRES_DIAS[opcion.diaNombre]} ${opcion.fecha.toLocaleDateString("es-ES",{day:"numeric", month:"long"})}`,
            hora: horarioSeleccionado,
            estadoTicket: estadoTicket  // 👈 incluir estado del ticket
          };

          guardarTurno(nuevoTurno);  // 👈 usa la función central
          turnosContainer.innerHTML = "";
        });

        editor.appendChild(select);
        editor.appendChild(btnAceptar);
      }
    });

    turnosContainer.appendChild(card);
  });
}

function filtrarPorRango(horarios, rango, tNum = 1) {
  const limites = {
    AM: { inicio: 9 * 60, fin: 13 * 60 },   // 09:00 - 13:00
    PM: { inicio: 14 * 60, fin: 18 * 60 },  // 14:00 - 18:00
  };

  if (!limites[rango]) return horarios;

  return horarios.filter(hora => {
    const [h, m] = hora.split(":").map(Number);
    const inicio = h * 60 + m;

    // Cada T = 15 minutos
    const duracion = tNum * 15;
    const fin = inicio + duracion;

    return inicio >= limites[rango].inicio && fin <= limites[rango].fin;
  });
}


// Función auxiliar para mostrar mensajes dentro de la card
function mostrarMensaje(card, texto, tipo = "error") {
  let mensaje = card.querySelector(".mensaje-turno");
  if (!mensaje) {
    mensaje = document.createElement("div");
    mensaje.className = "mensaje-turno";
    card.appendChild(mensaje);
  }
  mensaje.textContent = texto;
  mensaje.style.color = tipo === "error" ? "red" : "green";
  mensaje.style.fontWeight = "bold";
  mensaje.style.marginTop = "6px";
}

