import { T_VALUES, RANGOS } from "./constantes.js";
import { obtenerTurnosBackend, eliminarTurnoBackend } from "./historial.js";
import { enviarTurno } from "./envioTicketPOST.js";
import { renderSelectClientes, renderSelectTecnicos, renderSelectGen } from "./render_selects.js";
import { renderHistorialTurnos } from "./historial.js";
import { renderGrillaTurnos } from "./grilla.js";
import { clienteYaTieneTurno, hayConflicto } from "./validaciones.js";
import Tecnico from "../tecnico/Tecnico.js";
import { obtenerClientesBackend } from "../cliente/clienteApi.js";
import { obtenerTecnicosBackend } from "../tecnico/tecnicoApi.js";


document.addEventListener("DOMContentLoaded", async () => {

  // ============================
  // ESTADO UI
  // ============================

  const UI_STATE = {
    DISPONIBILIDAD: "DISPONIBILIDAD",
    HISTORIAL: "HISTORIAL"
  };

  let currentMode = UI_STATE.DISPONIBILIDAD;

  // ============================
  // ELEMENTOS DOM
  // ============================

  const tituloSeccion = document.getElementById("tituloSeccion");

  const turnosContainer = document.getElementById("turnosContainer");
  const historialContainer = document.getElementById("historialTurnos");

  const btnModoDisponibles = document.getElementById("btnModoDisponibles");
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
  // FUNCIONES DE MODO
  // ============================

  function cambiarModo(modo){

    currentMode = modo;

    if(modo === UI_STATE.DISPONIBILIDAD){

      tituloSeccion.textContent = "Turnos Disponibles";

      turnosContainer.style.display = "grid";
      historialContainer.style.display = "none";

      selectorFecha.style.display = "none";

      btnModoDisponibles.classList.add("active");
      btnModoHistorial.classList.remove("active");

    }

    if(modo === UI_STATE.HISTORIAL){

      tituloSeccion.textContent = "Historial de Turnos";

      turnosContainer.style.display = "none";
      historialContainer.style.display = "block";

      selectorFecha.style.display = "block";

      btnModoHistorial.classList.add("active");
      btnModoDisponibles.classList.remove("active");

    }

  }

  // ============================
  // EVENTOS MODO
  // ============================

  btnModoDisponibles.onclick = () =>
    cambiarModo(UI_STATE.DISPONIBILIDAD);

  btnModoHistorial.onclick = () =>
    cambiarModo(UI_STATE.HISTORIAL);

  // ============================
  // EVENTO HISTORIAL POR FECHA
  // ============================

  selectorFecha.onchange = async () => {

    const fecha = selectorFecha.value;

    if(!fecha) return;

    try{

      const turnosFecha =
        await obtenerTurnosPorFecha(fecha);

      renderHistorialTurnos(
        turnosFecha,
        historialContainer
      );

    }
    catch(e){

      console.error(e);

    }

  };

  // ============================
  // EVENTO DISPONIBILIDAD
  // ============================

  btnMostrarTurnos.onclick = () => {

    cambiarModo(UI_STATE.DISPONIBILIDAD);

    const clienteId = selectCliente.value;
    const tecnicoId = selectTecnico.value;
    const tSeleccionado = selectT.value;
    const rangoSeleccionado = selectRango.value;
    const estadoTicket = selectEstadoTicket.value;

    if (!clienteId || !tecnicoId ||
        !tSeleccionado || !rangoSeleccionado ||
        !estadoTicket)

      return alert("Complete todos los campos");

    if(clienteYaTieneTurno(clienteId, turnos))
      return alert("Cliente ya tiene turno");

    const tecnico =
      tecnicos.find(t => t.id === tecnicoId);

    renderGrillaTurnos({

      clienteId,
      tecnico,
      tSeleccionado,
      rangoSeleccionado,
      clientes,
      turnos,
      turnosContainer,
      estadoTicket,

      guardarTurno: async (turno) => {

        const turnoCreado =
          await enviarTurno(turno);

        turnos.push(turnoCreado);

      }

    });

  };

  // ============================
  // INIT SELECTS
  // ============================

  renderSelectClientes(selectCliente, clientes, turnos);

  renderSelectTecnicos(selectTecnico, tecnicos);

  renderSelectGen(selectT, T_VALUES);
  renderSelectGen(selectRango, RANGOS);
  renderSelectGen(selectEstadoTicket, ["Abierto"]);

  // ============================
  // MODO INICIAL
  // ============================

  cambiarModo(UI_STATE.DISPONIBILIDAD);

});