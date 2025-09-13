// grilla.js
// Funciones para armar la grilla de turnos
// Muestra las opciones de técnicos a elegir según los NAP´s

import { DAYS, NOMBRES_DIAS } from "./constantes.js";
import { formatearRango } from "./formateo.js";
import { saveData } from "./storage.js";
import { renderHistorialTurnos } from "./historial.js";

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

  const hoy = new Date();
  const fechasOpciones = [];
  let fecha = new Date(hoy);

  while (fechasOpciones.length < 3) {
    fecha.setDate(fecha.getDate() + 1);
    const diaNombre = DAYS[fecha.getDay()];

    if (diaNombre === "domingo") continue;
    if (!diasDisponiblesNAP.includes(diaNombre)) continue;

    const fechaISO = fecha.toISOString().slice(0,10);

    const conflicto = turnos.some(turno =>
      (turno.clienteId === cliente.numeroCliente) ||
      (turno.fecha === fechaISO && turno.hora === horaStr && turno.nap === nap.numero)
    );

    if (!conflicto) {
      fechasOpciones.push({ fecha: new Date(fecha), fechaISO, diaNombre });
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
      <button class="btnSeleccionarTurno">Seleccionar</button>
    `;

    card.querySelector(".btnSeleccionarTurno").addEventListener("click", () => {
      const disponibles = tecnicosDisp.filter(t =>
        !turnos.some(turno =>
          turno.fecha === opcion.fechaISO &&
          turno.hora === horaStr &&
          turno.tecnicos.includes(t.nombre + ' ' + (t.apellido||''))
        )
      );
      if (!disponibles.length) return alert("No hay técnicos disponibles para este horario");

      const tecnicoElegido = disponibles.reduce((prev, curr) => {
        const prevCount = turnos.filter(turno =>
          turno.tecnicos.includes(prev.nombre + ' ' + (prev.apellido||''))).length;
        const currCount = turnos.filter(turno =>
          turno.tecnicos.includes(curr.nombre + ' ' + (curr.apellido||''))).length;
        return prevCount <= currCount ? prev : curr;
      });

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
      alert(`Turno guardado. Técnico asignado: ${tecnicoElegido.nombre} ${tecnicoElegido.apellido||''}`);
      renderHistorialTurnos(turnos, turnosContainer);
      turnosContainer.innerHTML = "";
    });

    turnosContainer.appendChild(card);
  });
}
