import { DAYS, NOMBRES_DIAS } from "./constantes.js";
import { formatearRango } from "./formateo.js";
import { hayConflicto, obtenerHorariosDisponibles } from "./validaciones.js";
import { enviarTurno } from "./envioTicketPOST.js";
import { obtenerTurnosBackend } from "./historial.js"
import { agregarTurnoAlHistorial } from "./historial.js";



function calcularHoraFin(horaInicio, T) {

  const [h, m] = horaInicio.split(":").map(Number);

  const fecha = new Date();

  fecha.setHours(h);
  fecha.setMinutes(m + T * 15);

  return fecha.toTimeString().slice(0,5);

}

function construirTurnoBackend({
  cliente,
  tecnico,
  fechaISO,
  horaInicio,
  NumeroT,
  estadoTicket
}) {

  if (!cliente?.id)
    throw new Error("cliente.id faltante");

  if (!tecnico?.id)
    throw new Error("tecnico.id faltante");

  return {
  
    cliente_id: cliente.id,
  
    tecnico_id: tecnico.id,
  
    fecha: fechaISO,
  
    hora_inicio: horaInicio,
  
    hora_fin: calcularHoraFin(horaInicio, NumeroT),
  
    estado: estadoTicket,
  
    tipo_turno: "regular",
  
    numero_ticket: `${cliente.id}_${Date.now()}`
  
  };

}


// ========================================
// Genera opciones de horario según T y bloques
// ========================================
function generarOpcionesHorarios(NumeroT, bloques) {
  return bloques.map(bloque => formatearRango(bloque, NumeroT));
}

// ========================================
// Filtra horarios por rango AM/PM
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
    const fin = inicio + tNum * 15;
    return inicio >= limites[rango].inicio && fin <= limites[rango].fin;
  });
}

// ========================================
// Muestra mensajes dentro de la card
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
// Validación de existencia de cliente y técnico
// ========================================
// 🧩 Función que obtiene los datos del cliente, ya sea local o desde Andros
export async function obtenerClienteYValidar(clientes, clienteId, tecnico) {
  if (!clienteId) {
    alert("❌ Falta el ID de cliente.");
    return null;
  }

  // Buscar cliente localmente
  let cliente = clientes.find(c => String(c.id) === String(clienteId));


  // Si no está en tu base local, consultamos a Andros
  if (!cliente) {
    console.log(`🔎 Cliente ${clienteId} no encontrado localmente. Consultando a Andros...`);

    const API_ANDROS = "https://andros-api.ejemplo.com/api/clientes/";

    try {
      const response = await fetch(`${API_ANDROS}${clienteId}`);
      if (!response.ok) throw new Error(`Error ${response.status}`);

      const data = await response.json();
      console.log(data);

      // Adaptamos la estructura a la de tu sistema
      cliente = {
        id: data.id || clienteId,
        numero_cliente: data.id || clienteId,
        numeroCliente: data.id || clienteId, // compatibilidad
        nombre: data.nombre || "Sin nombre",
        apellido: data.apellido || "",
        direccion: data.direccion || "",
        telefono: data.telefono || "",
        fuente: "Andros"
      };

      console.log("✅ Cliente recuperado desde Andros:", cliente);

      // Agregamos el cliente al arreglo local (para reutilizar)
      clientes.push(cliente);
    } catch (error) {
      console.warn("⚠️ No se pudo obtener cliente desde Andros:", error);
      cliente = {
        numeroCliente: clienteId,
        nombre: "Cliente externo",
        apellido: "(sin datos)",
        fuente: "Andros"
      };
    }
  }

  // Validar técnico
  if (!tecnico) {
    alert("⚠️ No se encontró el técnico.");
    return null;
  }

  return cliente;
}


// ========================================
// Normaliza texto
// ========================================
function normalizarTexto(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// ========================================
// Obtiene fechas disponibles
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
      String(turno.cliente_id) === String(clienteId) &&
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

  const fechaFormateada =
  opcion.fecha.toLocaleDateString(
    "es-ES",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  );

  card.innerHTML = `
    <h3 class="card-fecha-turno">
      Fecha: ${fechaFormateada}
    </h3>

    <p><strong>Cliente:</strong> ${cliente.numero_cliente} - ${cliente.nombre} ${cliente.apellido}</p>

    <p><strong>Técnico:</strong> ${tecnico.nombre} ${tecnico.apellido}</p>

    <p><strong>T:</strong> ${NumeroT}</p>

    <p><strong>Rango:</strong> ${rangoSeleccionado}</p>

    <p><strong>Horario General:</strong> ${
      rangoSeleccionado == "AM"
        ? "09:00 - 13:00"
        : "14:00 - 18:00"
    }</p>

    <p><strong>Horario Sugerido:</strong>
      ${
        horaStr !== "Sin horario"
          ? formatearRango(horaStr, NumeroT)
          : "Sin horario disponible"
      }
    </p>

    <p><strong>Estado del Ticket:</strong> ${estadoTicket}</p>

    <button class="btnSeleccionarTurno"
      ${horaStr === "Sin horario" ? "disabled" : ""}>
      Selección automática
    </button>

    <button class="btnEditarTurno">
      Selección Manual
    </button>

    <div class="editorHorario"
      style="display:none; margin-top:8px;">
    </div>
  `;


  configurarSeleccionAutomatica(card, horaStr, opcion, cliente, tecnico, NumeroT, rangoSeleccionado, estadoTicket, guardarTurno, turnos, turnosContainer, enviarTurno
);
  configurarSeleccionManual(card, horariosDisponibles, NumeroT, opcion, cliente, tecnico, rangoSeleccionado, estadoTicket, guardarTurno, turnos, turnosContainer, enviarTurno
);

  return card;
}

// ========================================
// Configuración selección automática
// ========================================
function configurarSeleccionAutomatica(
  card,
  horaStr,
  opcion,
  cliente,
  tecnico,
  NumeroT,
  rangoSeleccionado,
  estadoTicket,
  guardarTurno,
  turnos,
  turnosContainer
) {

  card.querySelector(".btnSeleccionarTurno")
  .addEventListener("click", async () => {

    if (horaStr === "Sin horario")
      return alert("No hay horarios disponibles");

    if (
      hayConflicto(
        turnos,
        opcion.fechaISO,
        horaStr,
        `${tecnico.nombre} ${tecnico.apellido}`,
        cliente.numeroCliente,
        NumeroT
      )
    ) {

      mostrarMensaje(card, "⚠️ Horario ocupado");
      return;

    }

    try {

      const turnoBackend =
        construirTurnoBackend({

          cliente,
          tecnico,

          fechaISO: opcion.fechaISO,

          horaInicio: horaStr,

          NumeroT,

          estadoTicket

        });

      const historialContainer =
        document.getElementById("historialTurnos");

      const nuevoTurno =
        await guardarTurno(turnoBackend);

      // agregar historial
      if(historialContainer){
      
        agregarTurnoAlHistorial(
          nuevoTurno,
          historialContainer
        );
      
      }

      // limpiar grilla
      turnosContainer.innerHTML = "";

      // mostrar mensaje
      mostrarMensaje(card, "✅ Turno creado", "ok");


      // ✅ agregar al historial inmediatamente
      if(historialContainer){
      
        agregarTurnoAlHistorial(
          nuevoTurno,
          historialContainer
        );
      
      }

      turnosContainer.innerHTML = "";

      mostrarMensaje(card, "✅ Turno creado", "ok");

    }
    catch (error) {

      mostrarMensaje(card, error.message);

    }

  });

}


// ========================================
// Configuración selección manual
// ========================================
function configurarSeleccionManual(
  card,
  horariosDisponibles,
  NumeroT,
  opcion,
  cliente,
  tecnico,
  rangoSeleccionado,
  estadoTicket,
  guardarTurno,
  turnos,
  turnosContainer
) {

  card.querySelector(".btnEditarTurno")
  .addEventListener("click", () => {

    const editor = card.querySelector(".editorHorario");

    editor.style.display =
      editor.style.display === "none" ? "block" : "none";

    editor.innerHTML = "";

    if (editor.style.display !== "block") return;

    if (!horariosDisponibles.length) {
      editor.innerHTML = "<p>No hay horarios disponibles</p>";
      return;
    }

    // select con opciones
    const select = document.createElement("select");
    select.className = "select-horarios-manual";

    generarOpcionesHorarios(NumeroT, horariosDisponibles)
    .forEach(opt => {
      const option = document.createElement("option");
      option.value = opt.split(" ")[0]; // horaInicio
      option.textContent = opt; // muestra "09:00 (09:00 - 09:15)" o similar
      select.appendChild(option);
    });

    const btnAceptar = document.createElement("button");
    btnAceptar.textContent = "Confirmar";
    btnAceptar.className = "btnConfirmarManual";

    btnAceptar.onclick = async () => {
      const horaInicio = select.value;

      if (hayConflicto(
        turnos,
        opcion.fechaISO,
        horaInicio,
        `${tecnico.nombre} ${tecnico.apellido}`,
        cliente.numero_cliente || cliente.numeroCliente || cliente.id,
        NumeroT
      )) {
        mostrarMensaje(card, "⚠️ Horario ocupado");
        return;
      }

      try {
        const turnoBackend = construirTurnoBackend({
          cliente,
          tecnico,
          fechaISO: opcion.fechaISO,
          horaInicio,
          NumeroT,
          estadoTicket
        });

        const nuevoTurno =
          await guardarTurno(turnoBackend);

        // agregar historial
        if(historialContainer){
        
          agregarTurnoAlHistorial(
            nuevoTurno,
            historialContainer
          );
        
        }

        // limpiar grilla
        turnosContainer.innerHTML = "";

        // mostrar mensaje
        mostrarMensaje(card, "✅ Turno creado", "ok");


        // ✅ agregar al historial inmediatamente
        if(historialContainer){
        
          agregarTurnoAlHistorial(
            nuevoTurno,
            historialContainer
          );
        
        }

        turnosContainer.innerHTML = "";
        mostrarMensaje(card, "✅ Turno creado", "ok");

      } catch (error) {
        mostrarMensaje(card, error.message);
      }
    };

    editor.appendChild(select);
    editor.appendChild(btnAceptar);

  });

}


// ========================================
// Render de grilla
// ========================================
export async function renderGrillaTurnos({
  clienteId,
  tecnico,
  tSeleccionado,
  rangoSeleccionado,
  clientes,
  turnos,
  turnosContainer,
  guardarTurno,
  estadoTicket,
  enviarTurno

}) {
  turnosContainer.innerHTML = "";

  const cliente = await obtenerClienteYValidar(clientes, clienteId, tecnico);
  if (!cliente) return;

  const NumeroT = Number(tSeleccionado);
  const fechasOpciones = obtenerFechasDisponibles(tecnico, turnos, cliente.numeroCliente);

  if (!fechasOpciones.length) {
    return alert("No hay fechas disponibles según el técnico en los próximos 30 días");
  }

  fechasOpciones.forEach(opcion => {
    let horariosDisponibles = obtenerHorariosDisponibles(turnos, opcion.fechaISO, tecnico, opcion.diaNombre, cliente.numeroCliente, NumeroT);
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
      enviarTurno

    });

    turnosContainer.appendChild(card);
  });
}
