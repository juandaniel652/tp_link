import { T_VALUES, RANGOS } from "./constantes.js";
import { getData } from "./storage.js";
import { renderSelectClientes, renderSelectNaps, renderSelectGen } from "./render_selects.js";
import { renderHistorialTurnos } from "./historial.js";
import { renderGrillaTurnos } from "./grilla.js";
import { clienteYaTieneTurno, hayConflicto, filtrarClientesDisponibles } from "./validaciones.js";

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

  // Solo clientes que aún no tienen turno
  const clientesDisponibles = filtrarClientesDisponibles(clientes, turnos);
  renderSelectClientes(selectCliente, clientesDisponibles);

  renderSelectNaps(selectNap, puntosAcceso);
  renderSelectGen(selectT, T_VALUES, "Seleccionar T", "T");
  renderSelectGen(selectRango, RANGOS, "Seleccionar Rango", "");

  btnMostrarTurnos.addEventListener("click", () => {
    const clienteId = selectCliente.value;
    const napNumero = selectNap.value;
    const tSeleccionado = selectT.value;
    const rangoSeleccionado = selectRango.value;

    if (!clienteId || !napNumero || !tSeleccionado || !rangoSeleccionado)
      return alert("Debe seleccionar Cliente, NAP, T y Rango");

    // Verificar si el cliente ya tiene turno
    if (clienteYaTieneTurno(clienteId, turnos)) {
      return alert("Este cliente ya tiene un turno asignado.");
    }

    renderGrillaTurnos({
      clienteId,
      napNumero,
      tSeleccionado,
      rangoSeleccionado,
      clientes,
      puntosAcceso,
      tecnicos,
      turnos,
      turnosContainer
    });
  });

  renderHistorialTurnos(turnos, turnosContainer);
});
