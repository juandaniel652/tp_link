import { T_VALUES, RANGOS } from "./constantes.js";
import { getData } from "./storage.js";
import { renderSelectClientes, renderSelectTecnicos, renderSelectGen } from "./render_selects.js";
import { renderHistorialTurnos } from "./historial.js";
import { renderGrillaTurnos } from "./grilla.js";
import Tecnico from "../tecnico/Tecnico.js"; // 👈 importa la clase

document.addEventListener("DOMContentLoaded", () => {
  const clientes = getData("clientes");
  
  // 👇 convertir objetos planos en instancias de la clase Tecnico
  const tecnicosData = getData("tecnicos") || [];
  const tecnicos = tecnicosData.map(t => new Tecnico(t));

  let turnos = getData("turnos") || [];

  const selectCliente = document.getElementById("selectCliente");
  const selectTecnico = document.getElementById("selectTecnico"); // 👈 reemplaza a NAP
  const selectT = document.getElementById("selectT");
  const selectRango = document.getElementById("selectRango");
  const turnosContainer = document.getElementById("turnosContainer");
  const btnMostrarTurnos = document.getElementById("btnMostrarTurnos");

  // Renderizar selects
  renderSelectClientes(selectCliente, clientes);
  renderSelectTecnicos(selectTecnico, tecnicos); // 👈 ahora son instancias de Tecnico
  renderSelectGen(selectT, T_VALUES, "Seleccionar T", "T");
  renderSelectGen(selectRango, RANGOS, "Seleccionar Rango", "");

  // Evento principal
  btnMostrarTurnos.addEventListener("click", () => {
    const clienteId = selectCliente.value;
    const tecnicoIndex = selectTecnico.value; // 👈 usamos técnico
    const tSeleccionado = selectT.value;
    const rangoSeleccionado = selectRango.value;

    if (!clienteId || !tecnicoIndex || !tSeleccionado || !rangoSeleccionado)
      return alert("Debe seleccionar Cliente, Técnico, T y Rango");

    const tecnico = tecnicos[tecnicoIndex]; // 👈 recuperamos el objeto Técnico real

    renderGrillaTurnos({
      clienteId,
      tecnico,
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
