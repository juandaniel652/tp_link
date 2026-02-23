import { T_VALUES, RANGOS } from "./constantes.js";

import {
  obtenerTurnosBackend,
  renderHistorialTurnos
} from "./historial.js";

import {
  obtenerTurnosPorFecha
} from "./apiTurnos.js";

import { enviarTurno } from "./envioTicketPOST.js";

import {
  renderSelectClientes,
  renderSelectTecnicos,
  renderSelectGen
} from "./render_selects.js";

import { renderGrillaTurnos } from "./grilla.js";

import { clienteYaTieneTurno } from "./validaciones.js";

import Tecnico from "../tecnico/Tecnico.js";

import { obtenerClientesBackend } from "../cliente/clienteApi.js";
import { obtenerTecnicosBackend } from "../tecnico/tecnicoApi.js";


document.addEventListener("DOMContentLoaded", async () => {

  // ============================
  // UI STATE (simplificado)
  // ============================
  const UI_STATE = {
    DISPONIBILIDAD: "DISPONIBILIDAD",
    HISTORIAL: "HISTORIAL"
  };

  let currentMode = UI_STATE.DISPONIBILIDAD;

  // ============================
  // DOM
  // ============================
  const tituloSeccion = document.getElementById("tituloSeccion");
  const turnosContainer = document.getElementById("turnosContainer");
  const historialContainer = document.getElementById("historialTurnos");

  const btnModoHistorial = document.getElementById("btnModoHistorial");
  const selectorFecha = document.getElementById("selectorFechaHistorial");

  const btnMostrarTurnos = document.getElementById("btnMostrarTurnos");

  // selects
  const selectCliente = document.getElementById("selectCliente");
  const selectTecnico = document.getElementById("selectTecnico");
  const selectT = document.getElementById("selectT");
  const selectRango = document.getElementById("selectRango");
  const selectEstadoTicket = document.getElementById("selectEstadoTicket");

  // ============================
  // DATA
  // ============================
  const clientes = await obtenerClientesBackend();
  const tecnicosData = await obtenerTecnicosBackend();
  const tecnicos = tecnicosData.map(t => new Tecnico(t));

  let turnos = [];

  // ============================
  // CARGAR TURNOS INICIALES
  // ============================
  async function cargarTurnosIniciales(){
    try{
      turnos = await obtenerTurnosBackend();
      // render inicial en historial container (no mostrado mientras en disponibilidad)
      renderHistorialTurnos(turnos, historialContainer);
    } catch(e){
      console.error(e);
    }
  }

  // ============================
  // GUARDAR TURNO
  // ============================
  async function guardarTurnoBackend(turno){
    const turnoCreado = await enviarTurno(turno);
    turnos.push(turnoCreado);
  }

  // ============================
  // CAMBIAR MODO (simple)
  // ============================
  function cambiarModo(modo){
    currentMode = modo;

    if(modo === UI_STATE.DISPONIBILIDAD){
      tituloSeccion.textContent = "Turnos Disponibles";
      turnosContainer.style.display = "grid";
      historialContainer.style.display = "none";
      selectorFecha.style.display = "none";
      btnModoHistorial.classList.remove("active");
    }

    if(modo === UI_STATE.HISTORIAL){
      tituloSeccion.textContent = "Historial de Turnos";
      turnosContainer.style.display = "none";
      historialContainer.style.display = "block";
      selectorFecha.style.display = "block";
      btnModoHistorial.classList.add("active");
    }
  }

  // ============================
  // EVENTO HISTORIAL POR FECHA
  // ============================
  selectorFecha.onchange = async () => {
    const fecha = selectorFecha.value;
    if(!fecha) return;
    try{
      const turnosFecha = await obtenerTurnosPorFecha(fecha);
      renderHistorialTurnos(turnosFecha, historialContainer);
      cambiarModo(UI_STATE.HISTORIAL);
    } catch(e){
      console.error(e);
    }
  };

  // ============================
  // EVENTO MOSTRAR DISPONIBLES (botón principal)
  // ============================
  btnMostrarTurnos.onclick = async () => {

    cambiarModo(UI_STATE.DISPONIBILIDAD);

    const clienteId = selectCliente.value;
    const tecnicoId = selectTecnico.value;
    const tSeleccionado = selectT.value;
    const rangoSeleccionado = selectRango.value;
    const estadoTicket = selectEstadoTicket.value;

    if (!clienteId || !tecnicoId || !tSeleccionado || !rangoSeleccionado || !estadoTicket) {
      alert("Complete todos los campos");
      return;
    }

    if (clienteYaTieneTurno(clienteId, turnos)) {
      alert("Cliente ya tiene turno");
      return;
    }

    const tecnico = tecnicos.find(t => t.id === tecnicoId);

    // renderGrillaTurnos puede ser async si lo necesitás
    await renderGrillaTurnos({
      clienteId,
      tecnico,
      tSeleccionado,
      rangoSeleccionado,
      clientes,
      turnos,
      turnosContainer,
      estadoTicket,
      guardarTurno: guardarTurnoBackend
    });

  };

  // ============================
  // BOTÓN HISTORIAL
  // ============================
  btnModoHistorial.onclick = () => {
    // por defecto muestra el historial completo (sin filtrar)
    renderHistorialTurnos(turnos, historialContainer);
    cambiarModo(UI_STATE.HISTORIAL);
  };

  // ============================
  // INIT SELECTS
  // ============================
  renderSelectClientes(selectCliente, clientes, turnos);
  renderSelectTecnicos(selectTecnico, tecnicos);
  renderSelectGen(selectT, T_VALUES, "Seleccionar T", "T");
  renderSelectGen(selectRango, RANGOS, "Seleccionar rango", "");
  renderSelectGen(selectEstadoTicket, ["Abierto"], "Seleccionar estado", "");

  // ============================
  // INIT
  // ============================
  await cargarTurnosIniciales();
  cambiarModo(UI_STATE.DISPONIBILIDAD);

});