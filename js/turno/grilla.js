import { DAYS, NOMBRES_DIAS } from "./constantes.js";
import { formatearRango } from "./formateo.js";
import { saveData } from "./storage.js";
import { renderHistorialTurnos } from "./historial.js";

// Función auxiliar: generar todas las opciones de horarios válidos según rango y T
function generarOpcionesHorarios(rango, tNum) {
  const opciones = [];
  let inicio = rango === "AM" ? 9 * 60 : 14 * 60;   // minutos desde medianoche
  let fin = rango === "AM" ? 13 * 60 : 18 * 60;     // límite superior (13:00 o 18:00)

  for (let min = inicio; min + tNum * 15 <= fin; min += 15) {
    const h = Math.floor(min / 60).toString().padStart(2,"0");
    const m = (min % 60).toString().padStart(2,"0");
    const horaStr = `${h}:${m}`;
    opciones.push(formatearRango(horaStr, tNum));
  }
  return opciones;
}

export function renderGrillaTurnos({ clienteId, napNumero, tSeleccionado, rangoSeleccionado, clientes, puntosAcceso, tecnicos, turnos, turnosContainer }) {
  turnosContainer.innerHTML = "";
  const cliente = clientes.find(c => String(c.numeroCliente) === String(clienteId));
  const nap = puntosAcceso.find(p => String(p.numero) === String(napNumero));
  if (!cliente || !nap) return alert("Cliente o NAP no encontrado");

  const napStr = String(nap.numero);
  const tecnicosDisp = tecnicos.filter(t =>
    Array.isArray(t.puntosAcceso) && t.puntosAcceso.map(String).includes(napStr)
  );
  if (!tecnicosDisp.length) return alert("No hay técnicos que cubran este NAP");

  const tNum = Number(tSeleccionado);
  const horaBase = rangoSeleccionado === "AM" ? 9 : 14;
  const horaStr = `${horaBase.toString().padStart(2,"0")}:00`;

  if (turnos.some(turno => turno.clienteId === cliente.numeroCliente)) {
    return alert("Este cliente ya tiene un turno asignado.");
  }

  const diasDisponiblesNAP = nap.dias && Array.isArray(nap.dias) ? nap.dias.map(d => d.toLowerCase()) : DAYS;

  // ---- reemplazar la parte que genera fechasOpciones por esta versión ----
  const hoy = new Date();
  const fechasOpciones = [];
  let iterFecha = new Date(hoy);

  while (fechasOpciones.length < 3) {
    // arrancamos desde mañana (igual que tu código original)
    iterFecha.setDate(iterFecha.getDate() + 1);

    // NORMALIZO la fecha a medianoche en zona LOCAL para evitar shifts por UTC
    const fechaLocal = new Date(iterFecha.getFullYear(), iterFecha.getMonth(), iterFecha.getDate());

    const diaNombre = DAYS[fechaLocal.getDay()];
    if (diaNombre === "domingo") continue;
    if (!diasDisponiblesNAP.includes(diaNombre)) continue;

    // Construyo la "ISO local" YYYY-MM-DD manualmente
    const fechaISO = `${fechaLocal.getFullYear()}-${String(fechaLocal.getMonth() + 1).padStart(2, '0')}-${String(fechaLocal.getDate()).padStart(2, '0')}`;

    // Comparaciones robustas (normalizo a string)
    const conflicto = turnos.some(turno =>
      (String(turno.clienteId) === String(cliente.numeroCliente)) ||
      (turno.fecha === fechaISO && turno.hora === horaStr && String(turno.nap) === String(nap.numero))
    );

    if (!conflicto) {
      fechasOpciones.push({ fecha: fechaLocal, fechaISO, diaNombre });
    }
  }

  if (!fechasOpciones.length) return alert("No hay fechas próximas disponibles para este NAP");

  fechasOpciones.forEach(opcion => {
    const card = document.createElement("div");
    card.className = "card-turno";
    card.innerHTML = `
      <h3>${NOMBRES_DIAS[opcion.diaNombre]} ${opcion.fecha.toLocaleDateString("es-ES",{day:"numeric", month:"long"})}</h3>
      <p><strong>Cliente:</strong> ${cliente.numeroCliente} - ${cliente.nombre} ${cliente.apellido}</p>
      <p><strong>NAP:</strong> ${nap.numero}</p>
      <p><strong>T:</strong> ${tNum}</p>
      <p><strong>Rango:</strong> ${rangoSeleccionado}</p>
      <p><strong>Horario:</strong> ${formatearRango(horaStr, tNum)}</p>
      <p><strong>Técnicos disponibles:</strong> ${tecnicosDisp.map(t => t.nombre + ' ' + (t.apellido||'')).join(", ")}</p>
      <button class="btnSeleccionarTurno">Selección automática</button>
      <button class="btnEditarTurno">Selección Manual</button>
      <div class="editorHorario" style="display:none; margin-top:8px;"></div>
    `;

    // === SELECCIÓN AUTOMÁTICA (igual que antes) ===
    card.querySelector(".btnSeleccionarTurno").addEventListener("click", () => {
      const tecnicoElegido = tecnicosDisp[0]; // para simplificar aquí, puedes mantener tu lógica balanceada
      const nuevoTurno = {
        id: Date.now(),
        clienteId: cliente.numeroCliente,
        cliente: `${cliente.nombre} ${cliente.apellido}`.trim(),
        nap: nap.numero,
        t: tNum,
        rango: rangoSeleccionado,
        fecha: opcion.fechaISO,
        fechaStr: `${NOMBRES_DIAS[opcion.diaNombre]} ${opcion.fecha.toLocaleDateString("es-ES",{day:"numeric", month:"long"})}`,
        hora: horaStr,
        tecnicos: [tecnicoElegido.nombre + ' ' + (tecnicoElegido.apellido||'')]
      };
      turnos.push(nuevoTurno);
      saveData("turnos", turnos);
      renderHistorialTurnos(turnos, turnosContainer);
      turnosContainer.innerHTML = "";
    });

    // === EDICIÓN MANUAL DE HORARIO ===
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
        btnAceptar.className = "btn-primary"; // 👈 aplica el estilo del CSS
        btnAceptar.addEventListener("click", () => {
          const horarioSeleccionado = select.value;
          const tecnicoElegido = tecnicosDisp[0]; // misma lógica de asignación balanceada si prefieres

          const nuevoTurno = {
            id: Date.now(),
            clienteId: cliente.numeroCliente,
            cliente: `${cliente.nombre} ${cliente.apellido}`.trim(),
            nap: nap.numero,
            t: tNum,
            rango: rangoSeleccionado,
            fecha: opcion.fechaISO,
            fechaStr: `${NOMBRES_DIAS[opcion.diaNombre]} ${opcion.fecha.toLocaleDateString("es-ES",{day:"numeric", month:"long"})}`,
            hora: horarioSeleccionado.split(" ")[0], // toma la hora inicial
            tecnicos: [tecnicoElegido.nombre + ' ' + (tecnicoElegido.apellido||'')]
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
