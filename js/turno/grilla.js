import { DAYS, NOMBRES_DIAS } from "./constantes.js";
import { formatearRango } from "./formateo.js";
import { saveData } from "./storage.js";
import { renderHistorialTurnos } from "./historial.js";
import { hayConflicto, obtenerHorariosDisponibles } from "./validaciones.js";

// Genera opciones de horario según T y bloques
function generarOpcionesHorarios(tNum, bloques) {
  return bloques.map(bloque => formatearRango(bloque, tNum));
}

export function renderGrillaTurnos({
  clienteId,
  tecnico,          // 👈 ahora viene directamente el objeto Técnico
  tSeleccionado,
  rangoSeleccionado,
  clientes,
  tecnicos,
  turnos,
  turnosContainer
}) {
  turnosContainer.innerHTML = "";

  const cliente = clientes.find(c => String(c.numeroCliente) === String(clienteId));

  if (!cliente || !tecnico) return alert("Cliente o Técnico no encontrado");

  const tNum = Number(tSeleccionado);

  // ======================
  // Validación de días disponibles
  // ======================
  let diasDisponibles = tecnico.getDiasDisponibles();
  console.log("👉 Días disponibles del técnico:", diasDisponibles);
  console.log("👉 Días en DAYS:", DAYS);

  // Normalizar a minúsculas para comparación
  diasDisponibles = diasDisponibles.map(d => d.toLowerCase());
  console.log("👉 Días disponibles normalizados:", diasDisponibles);

  // Construimos fechasOpciones según los días del técnico
  const hoy = new Date();
  const fechasOpciones = [];
  let iterFecha = new Date(hoy);

  // Evitar bucles infinitos: máximo 30 días de búsqueda
  let count = 0;
  const maxIter = 30;

  while (fechasOpciones.length < 3 && count < maxIter) {
    iterFecha.setDate(iterFecha.getDate() + 1);
    const fechaLocal = new Date(iterFecha.getFullYear(), iterFecha.getMonth(), iterFecha.getDate());
    const diaNombre = DAYS[fechaLocal.getDay()]; // ya está en minúscula

    console.log(`Chequeando fecha ${fechaLocal.toDateString()} → ${diaNombre}`);

    if (!diasDisponibles.includes(diaNombre)) {
      count++;
      continue;
    }

    const fechaISO = `${fechaLocal.getFullYear()}-${String(fechaLocal.getMonth() + 1).padStart(2,'0')}-${String(fechaLocal.getDate()).padStart(2,'0')}`;

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

    // 🔹 Horarios disponibles para este técnico y día
    const horariosDisponibles = obtenerHorariosDisponibles(turnos, opcion.fechaISO, tecnico, opcion.diaNombre);
    console.log(`Horarios disponibles para ${opcion.fechaISO}:`, horariosDisponibles);

    const horaStr = horariosDisponibles.length ? horariosDisponibles[0] : "Sin horario";

    card.innerHTML = `
      <h3>${NOMBRES_DIAS[opcion.diaNombre]} ${opcion.fecha.toLocaleDateString("es-ES",{day:"numeric", month:"long"})}</h3>
      <p><strong>Cliente:</strong> ${cliente.numeroCliente} - ${cliente.nombre} ${cliente.apellido}</p>
      <p><strong>Técnico:</strong> ${tecnico.nombre} ${tecnico.apellido}</p>
      <p><strong>T:</strong> ${tNum}</p>
      <p><strong>Rango:</strong> ${rangoSeleccionado}</p>
      <p><strong>Horario:</strong> ${horaStr !== "Sin horario" ? formatearRango(horaStr, tNum) : "Sin horario disponible"}</p>
      <button class="btnSeleccionarTurno" ${horaStr === "Sin horario" ? "disabled" : ""}>Selección automática</button>
      <button class="btnEditarTurno">Selección Manual</button>
      <div class="editorHorario" style="display:none; margin-top:8px;"></div>
    `;

    // SELECCIÓN AUTOMÁTICA
    card.querySelector(".btnSeleccionarTurno").addEventListener("click", () => {
      if (horaStr === "Sin horario") return alert("No hay horarios disponibles para este día");

      if (hayConflicto(turnos, opcion.fechaISO, horaStr, `${tecnico.nombre} ${tecnico.apellido}`)) {
        return alert("Ese horario ya está ocupado para este técnico.");
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
      turnos.push(nuevoTurno);
      saveData("turnos", turnos);
      renderHistorialTurnos(turnos, turnosContainer);
      turnosContainer.innerHTML = "";
    });

    // EDICIÓN MANUAL
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
            return alert("Ese horario ya está ocupado para este técnico.");
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
          turnos.push(nuevoTurno);
          saveData("turnos", turnos);
          renderHistorialTurnos(turnos, turnosContainer);
          turnosContainer.innerHTML = "";
        });

        editor.appendChild(select);
        editor.appendChild(btnAceptar);
      }
    });

    turnosContainer.appendChild(card);
  });
}
