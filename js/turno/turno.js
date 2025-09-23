import { T_VALUES, RANGOS } from "./constantes.js";
import { getData } from "./storage.js";
import { renderSelectClientes, renderSelectTecnicos, renderSelectGen } from "./render_selects.js";
import { renderHistorialTurnos } from "./historial.js";
import { renderGrillaTurnos } from "./grilla.js";

document.addEventListener("DOMContentLoaded", () => {
  const clientes = getData("clientes");
  const tecnicos = getData("tecnicos");
  let turnos = getData("turnos");

  const selectCliente = document.getElementById("selectCliente");
  const selectTecnico = document.getElementById("selectTecnico"); // 👈 reemplaza a NAP
  const selectT = document.getElementById("selectT");
  const selectRango = document.getElementById("selectRango");
  const turnosContainer = document.getElementById("turnosContainer");
  const btnMostrarTurnos = document.getElementById("btnMostrarTurnos");

  // Renderizar selects
  renderSelectClientes(selectCliente, clientes);
  renderSelectTecnicos(selectTecnico, tecnicos); // 👈 nuevo
  renderSelectGen(selectT, T_VALUES, "Seleccionar T", "T");
  renderSelectGen(selectRango, RANGOS, "Seleccionar Rango", "");

  // Evento principal
  btnMostrarTurnos.addEventListener("click", () => {
    const clienteId = selectCliente.value;
    const tecnicoId = selectTecnico.value; // 👈 usamos técnico
    const tSeleccionado = selectT.value;
    const rangoSeleccionado = selectRango.value;

    if (!clienteId || !tecnicoId || !tSeleccionado || !rangoSeleccionado)
      return alert("Debe seleccionar Cliente, Técnico, T y Rango");

    renderGrillaTurnos({
      clienteId,
      tecnicoId,
      tSeleccionado,
      rangoSeleccionado,
      clientes,
      tecnicos,
      turnos,
      turnosContainer
    });
  });

  // Mostrar historial inicial
  renderHistorialTurnos(turnos, turnosContainer);
});
