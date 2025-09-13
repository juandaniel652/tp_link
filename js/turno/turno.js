import { T_VALUES, RANGOS } from "./constantes.js";
import { getData } from "./storage.js";
import { renderSelectClientes, renderSelectNaps, renderSelectGen } from "./render_selects.js";
import { renderHistorialTurnos } from "./historial.js";
import { renderGrillaTurnos } from "./grilla.js";

document.addEventListener("DOMContentLoaded", () => {
  const clientes = getData("clientes");
  const puntosAcceso = getData("puntosAcceso");
  const tecnicos = getData("tecnicos");
  let turnos = getData("turnos");

  const selectCliente = document.getElementById("selectCliente");
  const selectNap = document.getElementById("selectNap");
  const selectT = document.getElementById("selectT");
  const selectRango = document.getElementById("selectRango");
  const turnosContainer = document.getElementById("turnosContainer");
  const btnMostrarTurnos = document.getElementById("btnMostrarTurnos");

  renderSelectClientes(selectCliente, clientes);
  renderSelectNaps(selectNap, puntosAcceso);
  renderSelectGen(selectT, T_VALUES, "Seleccionar T");
  renderSelectGen(selectRango, RANGOS, "Seleccionar Rango");

  btnMostrarTurnos.addEventListener("click", () => {
    const clienteId = selectCliente.value;
    const napNumero = selectNap.value;
    const tSeleccionado = selectT.value;
    const rangoSeleccionado = selectRango.value;

    if (!clienteId || !napNumero || !tSeleccionado || !rangoSeleccionado)
      return alert("Debe seleccionar Cliente, NAP, T y Rango");

    renderGrillaTurnos({
      clienteId, napNumero, tSeleccionado, rangoSeleccionado,
      clientes, puntosAcceso, tecnicos, turnos, turnosContainer
    });
  });

  renderHistorialTurnos(turnos, turnosContainer);
});
