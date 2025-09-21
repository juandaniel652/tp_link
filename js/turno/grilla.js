import { DAYS, NOMBRES_DIAS } from "./constantes.js";
import { formatearRango } from "./formateo.js";
import { saveData } from "./storage.js";
import { renderHistorialTurnos } from "./historial.js";

// Generar horarios válidos en bloques de T
function generarOpcionesHorarios(rango, tNum) {
  const opciones = [];
  let inicio = rango === "AM" ? 9 * 60 : 14 * 60;
  let fin = rango === "AM" ? 13 * 60 : 18 * 60;

  for (let min = inicio; min + tNum * 15 <= fin; min += 15) {
    const h = Math.floor(min / 60).toString().padStart(2, "0");
    const m = (min % 60).toString().padStart(2, "0");
    const horaStr = `${h}:${m}`;
    opciones.push(formatearRango(horaStr, tNum));
  }
  return opciones;
}

export function renderGrillaTurnos({
  clienteId,
  tecnicoId,              // 👈 en vez de napNumero, ahora seleccionamos un técnico
  tSeleccionado,
  rangoSeleccionado,
  clientes,
  tecnicos,
  turnos,
  turnosContainer
}) {
  turnosContainer.innerHTML = "";

  const cliente = clientes.find(c => String(c.numeroCliente) === String(clienteId));
  const tecnico = tecnicos.find(t => String(t.id) === String(tecnicoId));
  if (!cliente || !tecnico) return alert("Cliente o técnico no encontrado");

  const tNum = Number(tSeleccionado);
  const horaBase = rangoSeleccionado === "AM" ? 9 : 14;
  const horaStr = `${horaBase.toString().padStart(2, "0")}:00`;

  if (turnos.some(turno => turno.clienteId === cliente.numeroCliente)) {
    return alert("Este cliente ya tiene un turno asignado.");
  }

  // Fechas disponibles (los próximos 3 días hábiles del técnico)
  const hoy = new Date();
  const fechasOpciones = [];
  let iterFecha = new Date(hoy);

  while (fechasOpciones.length < 3) {
    iterFecha.setDate(iterFecha.getDate() + 1);
    const fechaLocal = new Date(iterFecha.getFullYear(), iterFecha.getMonth(), iterFecha.getDate());

    const diaNombre = DAYS[fechaLocal.getDay()];
    if (diaNombre === "domingo") continue;

    // si el técnico tiene días asignados, respetarlos, si no => todos
    const diasDisponibles = tecnico.dias && Array.isArray(tecnico.dias) ? tecnico.dias.map(d => d.toLowerCase()) : DAYS;
    if (!diasDisponibles.includes(diaNombre)) continue;

    const fechaISO = `${fechaLocal.getFullYear()}-${String(fechaLocal.getMonth() + 1).padStart(2, '0')}-${String(fechaLocal.getDate()).padStart(2, '0')}`;

    const conflicto = turnos.some(turno =>
      (String(turno.clienteId) === String(cliente.numeroCliente)) ||
      (turno.fecha === fechaISO && turno.hora === horaStr && String(turno.tecnicoId) === String(tecnico.id))
    );

    if (!conflicto) {
      fechasOpciones.push({ fecha: fechaLocal, fechaISO, diaNombre });
    }
  }

  if (!fechasOpciones.length) return alert("No hay fechas próximas disponibles para este técnico");

  fechasOpciones.forEach(opcion => {
    const card = document.createElement("div");
    card.className = "card-turno";
    card.innerHTML = `
      <h3>${NOMBRES_DIAS[opcion.diaNombre]} ${opcion.fecha.toLocaleDateString("es-ES",{day:"numeric", month:"long"})}</h3>
      <p><strong>Cliente:</strong> ${cliente.numeroCliente} - ${cliente.nombre} ${cliente.apellido}</p>
      <p><strong>Técnico:</strong> ${tecnico.nombre} ${tecnico.apellido || ""}</p>
      <p><strong>T:</strong> ${tNum}</p>
      <p><strong>Rango:</strong> ${rangoSeleccionado}</p>
      <p><strong>Horario:</strong> ${formatearRango(horaStr, tNum)}</p>
      <button class="btnSeleccionarTurno">Selección automática</button>
      <button class="btnEditarTurno">Selección manual</button>
      <div class="editorHorario" style="display:none; margin-top:8px;"></div>
    `;

    // SELECCIÓN AUTOMÁTICA
    card.querySelector(".btnSeleccionarTurno").addEventListener("click", () => {
      const nuevoTurno = {
        id: Date.now(),
        clienteId: cliente.numeroCliente,
        cliente: `${cliente.nombre} ${cliente.apellido}`.trim(),
        tecnicoId: tecnico.id,
        tecnico: `${tecnico.nombre} ${tecnico.apellido || ""}`.trim(),
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

    // SELECCIÓN MANUAL
    card.querySelector(".btnEditarTurno").addEventListener("click", () => {
      const editor = card.querySelector(".editorHorario");
      editor.style.display = editor.style.display === "none" ? "block" : "none";
      editor.innerHTML = "";

      if (editor.style.display === "block") {
        const select = document.createElement("select");
        select.className = "form-turno-select";
        generarOpcionesHorarios(rangoSeleccionado, tNum).forEach(opt => {
          const option = document.createElement("option");
          option.value = opt;
          option.textContent = opt;
          select.appendChild(option);
        });

        const btnAceptar = document.createElement("button");
        btnAceptar.textContent = "Aceptar horario manual";
        btnAceptar.className = "btn-primary";
        btnAceptar.addEventListener("click", () => {
          const horarioSeleccionado = select.value;
          const nuevoTurno = {
            id: Date.now(),
            clienteId: cliente.numeroCliente,
            cliente: `${cliente.nombre} ${cliente.apellido}`.trim(),
            tecnicoId: tecnico.id,
            tecnico: `${tecnico.nombre} ${tecnico.apellido || ""}`.trim(),
            t: tNum,
            rango: rangoSeleccionado,
            fecha: opcion.fechaISO,
            fechaStr: `${NOMBRES_DIAS[opcion.diaNombre]} ${opcion.fecha.toLocaleDateString("es-ES",{day:"numeric", month:"long"})}`,
            hora: horarioSeleccionado.split(" ")[0] // solo la hora inicial
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
