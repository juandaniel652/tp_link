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

  const selectCliente = document.getElementById("selectCliente");
  const selectTecnico = document.getElementById("selectTecnico");
  const selectT = document.getElementById("selectT");
  const selectRango = document.getElementById("selectRango");
  const turnosContainer = document.getElementById("turnosContainer");
  const btnMostrarTurnos = document.getElementById("btnMostrarTurnos");

  // RENDER inicial (clientes pasan turnos para deshabilitar los que ya tienen)
  renderSelectClientes(selectCliente, clientes, turnos);
  renderSelectTecnicos(selectTecnico, tecnicos);
  renderSelectGen(selectT, T_VALUES, "Seleccionar T", "T");
  renderSelectGen(selectRango, RANGOS, "Seleccionar Rango", "");

  // ==============================
  // FUNCION GUARDAR TURNO
  // ==============================
  function guardarTurno(nuevoTurno) {
    // Agregar al array
    turnos.push(nuevoTurno);

    // Guardar en localStorage
    saveData("turnos", turnos);

    // Refrescar historial
    renderHistorialTurnos(turnos, turnosContainer);

    // Refrescar selects
    renderSelectClientes(selectCliente, clientes, turnos);
    renderSelectTecnicos(selectTecnico, tecnicos);
    renderSelectGen(selectT, T_VALUES, "Seleccionar T", "T");
    renderSelectGen(selectRango, RANGOS, "Seleccionar Rango", "");

    // 🔄 Resetear selección (placeholder activo)
    selectCliente.value = "";
    selectTecnico.value = "";
    selectT.value = "";
    selectRango.value = "";
  }

  // Evento principal
  btnMostrarTurnos.addEventListener("click", () => {
    const clienteId = selectCliente.value;
    const tecnicoIndex = selectTecnico.value;
    const tSeleccionado = selectT.value;
    const rangoSeleccionado = selectRango.value;

    if (!clienteId || !tecnicoIndex || !tSeleccionado || !rangoSeleccionado)
      return alert("Debe seleccionar Cliente, Técnico, T y Rango");

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
      tecnicos,
      turnos,
      turnosContainer,
      guardarTurno // 👈 pasamos la función para que grilla pueda guardar
    });
  });

  // Mostrar historial inicial
  renderHistorialTurnos(turnos, turnosContainer);
});
