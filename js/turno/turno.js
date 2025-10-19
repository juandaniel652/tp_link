import { T_VALUES, RANGOS } from "./constantes.js";
import { getData, saveData } from "./storage.js"; // 👈 IMPORT saveData
import { renderSelectClientes, renderSelectTecnicos, renderSelectGen } from "./render_selects.js";
import { renderHistorialTurnos } from "./historial.js";
import { renderGrillaTurnos } from "./grilla.js";
import { clienteYaTieneTurno } from "./validaciones.js"; // 👈 IMPORT
import Tecnico from "../tecnico/Tecnico.js";

document.addEventListener("DOMContentLoaded", () => {
  const clientes = getData("clientes") || [];
  const tecnicosData = getData("tecnicos") || [];
  const tecnicos = tecnicosData.map(t => new Tecnico(t));
  let turnos = getData("turnos") || [];

  const selectTicket = document.getElementById("selectTicket");
  const selectCliente = document.getElementById("selectCliente");
  const selectTecnico = document.getElementById("selectTecnico");
  const selectT = document.getElementById("selectT");
  const selectRango = document.getElementById("selectRango");
  const turnosContainer = document.getElementById("turnosContainer");
  const btnMostrarTurnos = document.getElementById("btnMostrarTurnos");
  const selectEstadoTicket = document.getElementById("selectEstadoTicket");

  // RENDER inicial (clientes pasan turnos para deshabilitar los que ya tienen)
  renderSelectGen(selectTicket, [], "Seleccionar Ticket", "");
  renderSelectClientes(selectCliente, clientes, turnos);
  renderSelectTecnicos(selectTecnico, tecnicos);
  renderSelectGen(selectT, T_VALUES, "Seleccionar T", "T");
  renderSelectGen(selectRango, RANGOS, "Seleccionar Rango", "");
  renderSelectGen(selectEstadoTicket, ["Abierto"], "Seleccionar Estado", "");

  // ==============================
  // FUNCION GUARDAR TURNO
  // ==============================
  function guardarTurno(nuevoTurno) {
    // Agregar al array
    turnos.push(nuevoTurno);

    // Guardar en localStorage
    saveData("turnos", turnos);

    // Refrescar historial con callback para actualizar select de clientes
    renderHistorialTurnos(turnos, turnosContainer, (turnosActualizados) => {
      renderSelectClientes(selectCliente, clientes, turnosActualizados);
    });

    // Refrescar selects técnicos y genéricos
    renderSelectTecnicos(selectTecnico, tecnicos);
    renderSelectGen(selectT, T_VALUES, "Seleccionar T", "T");
    renderSelectGen(selectRango, RANGOS, "Seleccionar Rango", "");
    renderSelectGen(selectEstadoTicket, ["Abierto", "Cerrado"], "Seleccionar Estado", "");

    // 🔄 Resetear selección (placeholder activo)
    selectCliente.value = "";
    selectTecnico.value = "";
    selectT.value = "";
    selectRango.value = "";
    selectEstadoTicket.value = "";
  }

  // Evento principal
  btnMostrarTurnos.addEventListener("click", () => {
    const clienteId = selectCliente.value;
    const tecnicoIndex = selectTecnico.value;
    const tSeleccionado = selectT.value;
    const rangoSeleccionado = selectRango.value;
    const estadoTicket = selectEstadoTicket.value;

    if (!clienteId || !tecnicoIndex || !tSeleccionado || !rangoSeleccionado || !estadoTicket)
      return alert("Debe seleccionar Cliente, Técnico, T, Rango y Estado.");

    // DOBLE VERIFICACIÓN
    if (clienteYaTieneTurno(clienteId, turnos)) {
      return alert("El cliente seleccionado ya tiene un turno asignado.");
    }

    const tecnico = tecnicos[tecnicoIndex];

    // Llamada a la grilla
    renderGrillaTurnos({
      clienteId,
      tecnico,
      tSeleccionado,
      rangoSeleccionado,
      clientes,
      turnos,
      turnosContainer,
      guardarTurno, // 👈 pasamos la función para que grilla pueda guardar
      estadoTicket  // 👈 pasamos el estado del ticket
    });
  });

  // Mostrar historial inicial con callback para actualizar select de clientes
  renderHistorialTurnos(turnos, turnosContainer, (turnosActualizados) => {
    renderSelectClientes(selectCliente, clientes, turnosActualizados);
  });
});
