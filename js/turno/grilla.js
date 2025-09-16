import { DAYS, NOMBRES_DIAS } from "./constantes.js";
import { formatearRango } from "./formateo.js";
import { saveData } from "./storage.js";
import { renderHistorialTurnos } from "./historial.js";

/* ========================= */
/* AUXILIARES DE NEGOCIO     */
/* ========================= */
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

function obtenerClienteNap({ clienteId, napNumero, clientes, puntosAcceso }) {
  const cliente = clientes.find(c => String(c.numeroCliente) === String(clienteId));
  const nap = puntosAcceso.find(p => String(p.numero) === String(napNumero));
  return { cliente, nap };
}

function obtenerTecnicosDisponibles(nap, tecnicos) {
  const napStr = String(nap.numero);
  return tecnicos.filter(t =>
    Array.isArray(t.puntosAcceso) && t.puntosAcceso.map(String).includes(napStr)
  );
}

function generarFechasDisponibles({ nap, cliente, rangoSeleccionado, tNum, turnos }) {
  const diasDisponiblesNAP = nap.dias && Array.isArray(nap.dias)
    ? nap.dias.map(d => d.toLowerCase())
    : DAYS;

  const hoy = new Date();
  const fechasOpciones = [];
  let iterFecha = new Date(hoy);

  while (fechasOpciones.length < 3) {
    iterFecha.setDate(iterFecha.getDate() + 1);
    const fechaLocal = new Date(iterFecha.getFullYear(), iterFecha.getMonth(), iterFecha.getDate());
    const diaNombre = DAYS[fechaLocal.getDay()];

    if (diaNombre === "domingo" || !diasDisponiblesNAP.includes(diaNombre)) continue;

    const fechaISO = `${fechaLocal.getFullYear()}-${String(fechaLocal.getMonth() + 1).padStart(2, "0")}-${String(fechaLocal.getDate()).padStart(2, "0")}`;

    const horaBase = rangoSeleccionado === "AM" ? 9 : 14;
    const horaStr = `${horaBase.toString().padStart(2, "0")}:00`;

    const conflicto = turnos.some(turno =>
      (String(turno.clienteId) === String(cliente.numeroCliente)) ||
      (turno.fecha === fechaISO && turno.hora === horaStr && String(turno.nap) === String(nap.numero))
    );

    if (!conflicto) {
      fechasOpciones.push({ fecha: fechaLocal, fechaISO, diaNombre, horaStr });
    }
  }
  return fechasOpciones;
}

/* ========================= */
/* AUXILIARES DE UI          */
/* ========================= */
function crearCardTurno({ opcion, cliente, nap, tNum, rangoSeleccionado, tecnicosDisp, turnos, turnosContainer }) {
  const card = document.createElement("div");
  card.className = "card-turno";
  card.innerHTML = `
    <h3>${NOMBRES_DIAS[opcion.diaNombre]} ${opcion.fecha.toLocaleDateString("es-ES", { day: "numeric", month: "long" })}</h3>
    <p><strong>Cliente:</strong> ${cliente.numeroCliente} - ${cliente.nombre} ${cliente.apellido}</p>
    <p><strong>NAP:</strong> ${nap.numero}</p>
    <p><strong>T:</strong> ${tNum}</p>
    <p><strong>Rango:</strong> ${rangoSeleccionado}</p>
    <p><strong>Horario:</strong> ${formatearRango(opcion.horaStr, tNum)}</p>
    <p><strong>Técnicos disponibles:</strong> ${tecnicosDisp.map(t => t.nombre + ' ' + (t.apellido || '')).join(", ")}</p>
    <button class="btnSeleccionarTurno">Selección automática</button>
    <button class="btnEditarTurno">Selección Manual</button>
    <div class="editorHorario" style="display:none; margin-top:8px;"></div>
  `;

  configurarBotonSeleccionAutomatica({ card, opcion, cliente, nap, tNum, rangoSeleccionado, tecnicosDisp, turnos, turnosContainer });
  configurarBotonEdicionManual({ card, opcion, cliente, nap, tNum, rangoSeleccionado, tecnicosDisp, turnos, turnosContainer });

  return card;
}

function configurarBotonSeleccionAutomatica({ card, opcion, cliente, nap, tNum, rangoSeleccionado, tecnicosDisp, turnos, turnosContainer }) {
  card.querySelector(".btnSeleccionarTurno").addEventListener("click", () => {
    const tecnicoElegido = tecnicosDisp[0];
    const nuevoTurno = {
      id: Date.now(),
      clienteId: cliente.numeroCliente,
      cliente: `${cliente.nombre} ${cliente.apellido}`.trim(),
      nap: nap.numero,
      t: tNum,
      rango: rangoSeleccionado,
      fecha: opcion.fechaISO,
      fechaStr: `${NOMBRES_DIAS[opcion.diaNombre]} ${opcion.fecha.toLocaleDateString("es-ES", { day: "numeric", month: "long" })}`,
      hora: opcion.horaStr,
      tecnicos: [tecnicoElegido.nombre + ' ' + (tecnicoElegido.apellido || '')]
    };
    turnos.push(nuevoTurno);
    saveData("turnos", turnos);
    renderHistorialTurnos(turnos, turnosContainer);
    turnosContainer.innerHTML = "";
  });
}

function configurarBotonEdicionManual({ card, opcion, cliente, nap, tNum, rangoSeleccionado, tecnicosDisp, turnos, turnosContainer }) {
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
        const tecnicoElegido = tecnicosDisp[0];

        const nuevoTurno = {
          id: Date.now(),
          clienteId: cliente.numeroCliente,
          cliente: `${cliente.nombre} ${cliente.apellido}`.trim(),
          nap: nap.numero,
          t: tNum,
          rango: rangoSeleccionado,
          fecha: opcion.fechaISO,
          fechaStr: `${NOMBRES_DIAS[opcion.diaNombre]} ${opcion.fecha.toLocaleDateString("es-ES", { day: "numeric", month: "long" })}`,
          hora: horarioSeleccionado.split(" ")[0],
          tecnicos: [tecnicoElegido.nombre + ' ' + (tecnicoElegido.apellido || '')]
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
}

/* ========================= */
/* ORQUESTADOR PRINCIPAL     */
/* ========================= */
export function renderGrillaTurnos({ clienteId, napNumero, tSeleccionado, rangoSeleccionado, clientes, puntosAcceso, tecnicos, turnos, turnosContainer }) {
  turnosContainer.innerHTML = "";

  const { cliente, nap } = obtenerClienteNap({ clienteId, napNumero, clientes, puntosAcceso });
  if (!cliente || !nap) return alert("Cliente o NAP no encontrado");

  if (turnos.some(turno => turno.clienteId === cliente.numeroCliente)) {
    return alert("Este cliente ya tiene un turno asignado.");
  }

  const tecnicosDisp = obtenerTecnicosDisponibles(nap, tecnicos);
  if (!tecnicosDisp.length) return alert("No hay técnicos que cubran este NAP");

  const tNum = Number(tSeleccionado);
  const fechasOpciones = generarFechasDisponibles({ nap, cliente, rangoSeleccionado, tNum, turnos });

  if (!fechasOpciones.length) return alert("No hay fechas próximas disponibles para este NAP");

  fechasOpciones.forEach(opcion => {
    const card = crearCardTurno({ opcion, cliente, nap, tNum, rangoSeleccionado, tecnicosDisp, turnos, turnosContainer });
    turnosContainer.appendChild(card);
  });
}
