import { DAYS, NOMBRES_DIAS } from "./constantes.js";
import { formatearRango } from "./formateo.js";
import { saveData } from "./storage.js";
import { renderHistorialTurnos } from "./historial.js";
import { hayConflicto } from "./validaciones.js";

/* ========================= */
/* AUXILIARES DE NEGOCIO     */
/* ========================= */
// ahora devuelve objetos { inicio: "HH:MM", label: "09:00 - 09:15" }
function generarOpcionesHorarios(rango, tNum) {
  const opciones = [];
  let inicio = rango === "AM" ? 9 * 60 : 14 * 60;
  let fin = rango === "AM" ? 13 * 60 : 18 * 60;

  for (let min = inicio; min + tNum * 15 <= fin; min += 15) {
    const h = Math.floor(min / 60).toString().padStart(2, "0");
    const m = (min % 60).toString().padStart(2, "0");
    const horaStr = `${h}:${m}`; // inicio en HH:MM
    const label = formatearRango(horaStr, tNum);
    opciones.push({ inicio: horaStr, label });
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

// Normaliza turnos existentes: deja turno.hora en "HH:MM" y t como Number
function normalizarTurnos(turnos) {
  if (!Array.isArray(turnos)) return;
  turnos.forEach(turno => {
    if (turno && turno.hora) {
      const match = String(turno.hora).match(/(\d{1,2}:\d{2})/);
      if (match) turno.hora = match[1].padStart(5, "0");
    }
    turno.t = Number(turno.t) || 1;
  });
}

function generarFechasDisponibles({ nap, cliente, rangoSeleccionado, tNum, turnos }) {
  const hoy = new Date();
  const fechasOpciones = [];
  let iterFecha = new Date(hoy);

  const horariosNap = Array.isArray(nap.horarios) ? nap.horarios : [];

  while (fechasOpciones.length < 3) {
    iterFecha.setDate(iterFecha.getDate() + 1);

    const fechaLocal = new Date(iterFecha.getFullYear(), iterFecha.getMonth(), iterFecha.getDate());
    const diaNombre = DAYS[fechaLocal.getDay()];

    const permitido = horariosNap.some(h => h.dia === diaNombre && h.rango === rangoSeleccionado);
    if (!permitido) continue;

    const fechaISO = `${fechaLocal.getFullYear()}-${String(fechaLocal.getMonth() + 1).padStart(2, "0")}-${String(fechaLocal.getDate()).padStart(2, "0")}`;

    // Generamos todas las opciones y buscamos el primer inicio libre ese día
    const opciones = generarOpcionesHorarios(rangoSeleccionado, tNum);
    let primerInicioLibre = null;
    for (const opt of opciones) {
      const inicio = opt.inicio; // ahora es confiable "HH:MM"
      if (!hayConflicto(turnos, fechaISO, inicio, nap.numero, tNum)) {
        primerInicioLibre = inicio;
        break;
      }
    }

    if (primerInicioLibre) {
      fechasOpciones.push({ fecha: fechaLocal, fechaISO, diaNombre, horaStr: primerInicioLibre });
    }
    // si no hay inicio libre en ese día, lo descartamos
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
    <p><strong>Horario (sugerido):</strong> ${formatearRango(opcion.horaStr, tNum)}</p>
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
    // Buscamos el primer inicio disponible para esa fecha y tNum
    const opciones = generarOpcionesHorarios(rangoSeleccionado, tNum);
    let inicioLibre = null;
    for (const opt of opciones) {
      const inicio = opt.inicio;
      if (!hayConflicto(turnos, opcion.fechaISO, inicio, nap.numero, tNum)) {
        inicioLibre = inicio;
        break;
      }
    }

    if (!inicioLibre) {
      alert("No hay horarios libres en esa fecha para asignación automática.");
      return;
    }

    // comprobación final ANTES de guardar (protege race condition / doble click)
    if (hayConflicto(turnos, opcion.fechaISO, inicioLibre, nap.numero, tNum)) {
      alert("El horario ya fue ocupado por otro turno. Se actualizará la grilla.");
      // opcional: forzar refresco de la grilla actual (puede llamarse desde el orquestador)
      // como mínimo removemos esta card para que no quede visible
      card.remove();
      return;
    }

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
      hora: inicioLibre, // guardamos sólo inicio en HH:MM
      tecnicos: [tecnicoElegido.nombre + ' ' + (tecnicoElegido.apellido || '')]
    };

    turnos.push(nuevoTurno);
    saveData("turnos", turnos);
    renderHistorialTurnos(turnos, turnosContainer);
    // 🚀 Notificar a turno.js que hay un nuevo turno
    document.dispatchEvent(new CustomEvent("turnoGuardado"));
    // removemos la card para que no siga ofertando la misma opción visualmente
    card.remove();
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

      // Generamos opciones como objetos {inicio,label}
      const opciones = generarOpcionesHorarios(rangoSeleccionado, tNum);
      opciones.forEach(opt => {
        const inicio = opt.inicio; // "HH:MM"
        const ocupado = hayConflicto(turnos, opcion.fechaISO, inicio, nap.numero, tNum);

        if (!ocupado) {
          const option = document.createElement("option");
          option.value = inicio;      // guardamos sólo el inicio
          option.textContent = opt.label;   // mostramos la etiqueta formateada
          select.appendChild(option);
        }
      });

      if (!select.options.length) {
        const msg = document.createElement("p");
        msg.textContent = "No hay horarios disponibles en este rango.";
        editor.appendChild(msg);
        return;
      }

      const btnAceptar = document.createElement("button");
      btnAceptar.textContent = "Aceptar horario manual";
      btnAceptar.className = "btn-primary";
      btnAceptar.addEventListener("click", () => {
        const horarioSeleccionado = select.value; // ya es "HH:MM"

        // comprobación final ANTES de guardar
        if (hayConflicto(turnos, opcion.fechaISO, horarioSeleccionado, nap.numero, tNum)) {
          alert("El horario seleccionado ya fue reservado por otro turno. Vuelva a intentar.");
          // podemos forzar la reapertura del editor o actualizar la lista:
          editor.innerHTML = "";
          card.querySelector(".btnEditarTurno").click(); // toggle para cerrar
          return;
        }

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
          hora: horarioSeleccionado,
          tecnicos: [tecnicoElegido.nombre + ' ' + (tecnicoElegido.apellido || '')]
        };

        turnos.push(nuevoTurno);
        saveData("turnos", turnos);
        renderHistorialTurnos(turnos, turnosContainer);
        turnosContainer.innerHTML = "";
        card.remove(); // quitamos la card para que no siga apareciendo la opción
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

  // Normalizamos turnos antes de cualquier lógica
  normalizarTurnos(turnos);

  const { cliente, nap } = obtenerClienteNap({ clienteId, napNumero, clientes, puntosAcceso });
  if (!cliente || !nap) return alert("Cliente o NAP no encontrado");

  if (turnos.some(turno => String(turno.clienteId) === String(cliente.numeroCliente))) {
    return alert("Este cliente ya tiene un turno asignado.");
  }

  const tecnicosDisp = obtenerTecnicosDisponibles(nap, tecnicos);
  if (!tecnicosDisp.length) return alert("No hay técnicos que cubran este NAP");

  const tNum = Number(tSeleccionado);

  // validar rangoSeleccionado contra horarios del NAP
  const horariosNap = Array.isArray(nap.horarios) ? nap.horarios : [];
  const rangosPermitidos = horariosNap.map(h => `${h.dia}|${h.rango}`);

  if (!rangosPermitidos.some(r => r.endsWith(`|${rangoSeleccionado}`))) {
    return alert(`El NAP ${nap.numero} no tiene configurado el rango ${rangoSeleccionado}`);
  }

  // ahora generamos fechas que tengan al menos 1 inicio libre para ese tNum
  const fechasOpciones = generarFechasDisponibles({ nap, cliente, rangoSeleccionado, tNum, turnos });

  if (!fechasOpciones.length) return alert("No hay fechas próximas disponibles para este NAP");

  fechasOpciones.forEach(opcion => {
    const clave = `${opcion.diaNombre}|${rangoSeleccionado}`;
    if (!rangosPermitidos.includes(clave)) return;

    const card = crearCardTurno({ 
      opcion, cliente, nap, tNum, rangoSeleccionado, tecnicosDisp, turnos, turnosContainer 
    });
    turnosContainer.appendChild(card);
  });
}
