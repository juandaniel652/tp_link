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
  tecnicos,
  turnos,
  turnosContainer,
  guardarTurno      // 👈 función centralizada de principal.js
}) {
  turnosContainer.innerHTML = "";

  const cliente = clientes.find(c => String(c.numeroCliente) === String(clienteId));
  if (!cliente || !tecnico) return alert("Cliente o Técnico no encontrado");

  const tNum = Number(tSeleccionado);

  // ======================
  // Validación de días disponibles
  // ======================
  let diasDisponibles = tecnico.getDiasDisponibles();
  diasDisponibles = diasDisponibles.map(d => d.toLowerCase());

  const hoy = new Date();
  const fechasOpciones = [];
  let iterFecha = new Date(hoy);

  let count = 0;
  const maxIter = 30;

  while (fechasOpciones.length < 3 && count < maxIter) {
    iterFecha.setDate(iterFecha.getDate() + 1);
    const fechaLocal = new Date(iterFecha.getFullYear(), iterFecha.getMonth(), iterFecha.getDate());
    const diaNombre = DAYS[fechaLocal.getDay()]; // ya está en minúscula

    if (!diasDisponibles.includes(diaNombre)) {
      count++;
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

    count++;
  }

  if (!fechasOpciones.length) {
    return alert("No hay fechas disponibles según el técnico en los próximos 30 días");
  }

  fechasOpciones.forEach(opcion => {
    const card = document.createElement("div");
    card.className = "card-turno";

    // 🔹 Horarios disponibles
    let horariosDisponibles = obtenerHorariosDisponibles(turnos, opcion.fechaISO, tecnico, opcion.diaNombre);
    horariosDisponibles = filtrarPorRango(horariosDisponibles, rangoSeleccionado);

    const horaStr = horariosDisponibles.length ? horariosDisponibles[0] : "Sin horario";

    card.innerHTML = `
      <h3>${NOMBRES_DIAS[opcion.diaNombre]} ${opcion.fecha.toLocaleDateString("es-ES",{day:"numeric", month:"long"})}</h3>
      <p><strong>Cliente:</strong> ${cliente.numeroCliente} - ${cliente.nombre} ${cliente.apellido}</p>
      <p><strong>Técnico:</strong> ${tecnico.nombre} ${tecnico.apellido}</p>
      <p><strong>T:</strong> ${tNum}</p>
      <p><strong>Rango:</strong> ${rangoSeleccionado}</p>
      <p><strong>Horario General:</strong> ${rangoSeleccionado == "AM" ? "09:00 - 13:00" : "14:00 - 18:00"}</p>
      <p><strong>Horario:</strong> ${horaStr !== "Sin horario" ? formatearRango(horaStr, tNum) : "Sin horario disponible"}</p>
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
        t: tNum,
        rango: rangoSeleccionado,
        fecha: opcion.fechaISO,
        fechaStr: `${NOMBRES_DIAS[opcion.diaNombre]} ${opcion.fecha.toLocaleDateString("es-ES",{day:"numeric", month:"long"})}`,
        hora: horaStr
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

        generarOpcionesHorarios(tNum, horariosDisponibles).forEach(opt => {
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
            t: tNum,
            rango: rangoSeleccionado,
            fecha: opcion.fechaISO,
            fechaStr: `${NOMBRES_DIAS[opcion.diaNombre]} ${opcion.fecha.toLocaleDateString("es-ES",{day:"numeric", month:"long"})}`,
            hora: horarioSeleccionado
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

function filtrarPorRango(horarios, rango) {
  if (rango === "AM") {
    return horarios.filter(hora => {
      const [h] = hora.split(":").map(Number);
      return h >= 9 && h < 12; // 09:00 - 12:59
    });
  }
  if (rango === "PM") {
    return horarios.filter(hora => {
      const [h] = hora.split(":").map(Number);
      return h >= 14 && h < 17; // 14:00 - 17:59
    });
  }
  return horarios;
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

