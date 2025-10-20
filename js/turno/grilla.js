import { DAYS, NOMBRES_DIAS } from "./constantes.js";
import { formatearRango } from "./formateo.js";
import { hayConflicto, obtenerHorariosDisponibles } from "./validaciones.js";


// ========================================
// Genera opciones de horario según T y bloques
// ========================================
function generarOpcionesHorarios(NumeroT, bloques) {
  return bloques.map(bloque => formatearRango(bloque, NumeroT));
}

// ========================================
// Obtiene las fechas según los clientes y técnicos ya asignados
// ========================================
function filtrarPorRango(horarios, rango, tNum = 1) {
  const limites = {
    AM: { inicio: 9 * 60, fin: 13 * 60 },
    PM: { inicio: 14 * 60, fin: 18 * 60 },
  };

  if (!limites[rango]) return horarios;

  return horarios.filter(hora => {
    const [h, m] = hora.split(":").map(Number);
    const inicio = h * 60 + m;
    const duracion = tNum * 15;
    const fin = inicio + duracion;

    return inicio >= limites[rango].inicio && fin <= limites[rango].fin;
  });
}

// ========================================
// Función auxiliar para mostrar mensajes dentro de la card
// ========================================
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

// ========================================
// Validación de existencia de clientes y técnico
// ========================================
function obtenerClienteYValidar(clientes, clienteId, tecnico) {
  const cliente = clientes.find(c => String(c.numeroCliente) === String(clienteId));
  if (!cliente || !tecnico) {
    alert("Cliente o Técnico no encontrado");
    return null;
  }
  return cliente;
}

// ========================================
// Normalizar texto
// ========================================
function normalizarTexto(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// ========================================
// Pasa los horarios disponibles en la grilla
// ========================================
function obtenerFechasDisponibles(tecnico, turnos, clienteId) {
  const diasDisponibles = tecnico.getDiasDisponibles().map(d => d.toLowerCase());
  const hoy = new Date();
  const fechasOpciones = [];
  let iterFecha = new Date(hoy);
  let contador = 0;

  while (fechasOpciones.length < 3 && contador < 30) {
    iterFecha.setDate(iterFecha.getDate() + 1);
    const fechaLocal = new Date(iterFecha.getFullYear(), iterFecha.getMonth(), iterFecha.getDate());

    const diaNombre = fechaLocal.toLocaleDateString('es-ES', { weekday: 'long' })
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    const esDomingo = fechaLocal.getDay() === 0;
    const estaDisponible = diasDisponibles.some(d => normalizarTexto(d) === normalizarTexto(diaNombre));

    if (esDomingo || !estaDisponible) {
      contador++;
      continue;
    }

    const fechaISO = `${fechaLocal.getFullYear()}-${String(fechaLocal.getMonth() + 1).padStart(2,"0")}-${String(fechaLocal.getDate()).padStart(2,"0")}`;

    const conflictoCliente = turnos.some(turno =>
      String(turno.clienteId) === String(clienteId) &&
      turno.fecha === fechaISO
    );

    if (!conflictoCliente) {
      fechasOpciones.push({ fecha: fechaLocal, fechaISO, diaNombre });
    }

    contador++;
  }

  return fechasOpciones;
}

// ========================================
// Crea la card de turno
// ========================================
function crearCardTurno({
  cliente,
  tecnico,
  NumeroT,
  rangoSeleccionado,
  opcion,
  horariosDisponibles,
  estadoTicket,
  guardarTurno,
  turnos,
  turnosContainer
}) {
  const card = document.createElement("div");
  card.className = "card-turno";

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

  configurarSeleccionAutomatica(card, horaStr, opcion, cliente, tecnico, NumeroT, rangoSeleccionado, estadoTicket, guardarTurno, turnos, turnosContainer, enviarTicket);
  configurarSeleccionManual(card, horariosDisponibles, NumeroT, opcion, cliente, tecnico, rangoSeleccionado, estadoTicket, guardarTurno, turnos, turnosContainer, enviarTicket);

  return card;
}

// ========================================
// Configuración selección automática
// ========================================
function configurarSeleccionAutomatica(card, horaStr, opcion, cliente, tecnico, NumeroT, rangoSeleccionado, estadoTicket, guardarTurno, turnos, turnosContainer, enviarTicket) {
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
      estadoTicket
    };

    guardarTurno(nuevoTurno);
    turnosContainer.innerHTML = "";
    enviarTicket(nuevoTurno); // ✅ envío automático
  });
}

// ========================================
// Configuración selección manual
// ========================================
function configurarSeleccionManual(card, horariosDisponibles, NumeroT, opcion, cliente, tecnico, rangoSeleccionado, estadoTicket, guardarTurno, turnos, turnosContainer, enviarTicket) {
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
          estadoTicket
        };

        guardarTurno(nuevoTurno);
        turnosContainer.innerHTML = "";
        enviarTicket(nuevoTurno); // ✅ envío automático
      });

      editor.appendChild(select);
      editor.appendChild(btnAceptar);
    }
  });
}

// ========================================
// Render de grilla
// ========================================
export function renderGrillaTurnos({
  clienteId,
  tecnico,
  tSeleccionado,
  rangoSeleccionado,
  clientes,
  turnos,
  turnosContainer,
  guardarTurno,
  estadoTicket,
  enviarTicket
}) {
  turnosContainer.innerHTML = "";

  const cliente = obtenerClienteYValidar(clientes, clienteId, tecnico);
  if (!cliente) return;

  const NumeroT = Number(tSeleccionado);
  const fechasOpciones = obtenerFechasDisponibles(tecnico, turnos, cliente.numeroCliente);

  if (!fechasOpciones.length) {
    return alert("No hay fechas disponibles según el técnico en los próximos 30 días");
  }

  fechasOpciones.forEach(opcion => {
    let horariosDisponibles = obtenerHorariosDisponibles(turnos, opcion.fechaISO, tecnico, opcion.diaNombre);
    horariosDisponibles = filtrarPorRango(horariosDisponibles, rangoSeleccionado, NumeroT);

    const card = crearCardTurno({
      cliente,
      tecnico,
      NumeroT,
      rangoSeleccionado,
      opcion,
      horariosDisponibles,
      estadoTicket,
      guardarTurno,
      turnos,
      turnosContainer,
      enviarTicket
    });

    turnosContainer.appendChild(card);
  });
}
