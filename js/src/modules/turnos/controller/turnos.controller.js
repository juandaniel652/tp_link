import { T_VALUES, RANGOS } from "../../turnos/constantes.js";
import { cambiarEstado, UI_STATE } from "../../turnos/uiState.js";
import {
  obtenerTurnosBackend,
  renderHistorialTurnos
} from "../../turnos/historial.js";
import { obtenerTurnosPorFecha } from "../../turnos/apiTurnos.js";
import { enviarTurno } from "../../turnos/envioTicketPOST.js";
import {
  renderSelectClientes,
  renderSelectTecnicos,
  renderSelectGen
} from "../../turnos/render_selects.js";
import { renderGrillaTurnos } from "../../turnos/grilla.js";
import { clienteYaTieneTurno } from "../../turnos/validaciones.js";

import Tecnico from "../../../tecnico/Tecnico.js";
import { obtenerClientesBackend } from "../../../cliente/clienteApi.js";
import { obtenerTecnicosBackend } from "../../../tecnico/tecnicoApi.js";

export async function initTurnosPage() {

  // ================= DOM =================

  const tituloSeccion = document.getElementById("tituloSeccion");
  const turnosContainer = document.getElementById("turnosContainer");
  const historialContainer = document.getElementById("historialTurnos");
  const btnModoHistorial = document.getElementById("btnModoHistorial");
  const selectorFecha = document.getElementById("selectorFechaHistorial");
  const btnMostrarTurnos = document.getElementById("btnMostrarTurnos");

  const selectCliente = document.getElementById("selectCliente");
  const selectTecnico = document.getElementById("selectTecnico");
  const selectT = document.getElementById("selectT");
  const selectRango = document.getElementById("selectRango");
  const selectEstadoTicket = document.getElementById("selectEstadoTicket");

  // ================= DATA =================

  const clientes = await obtenerClientesBackend();
  const tecnicosData = await obtenerTecnicosBackend();
  const tecnicos = tecnicosData.map(t => new Tecnico(t));

  let turnos = [];

  async function cargarTurnosIniciales() {
    try {
      turnos = await obtenerTurnosBackend();
      renderHistorialTurnos(turnos, historialContainer);
    } catch (e) {
      console.error("Error cargando turnos:", e);
    }
  }

  async function guardarTurnoBackend(turno) {
    const turnoCreado = await enviarTurno(turno);
    turnos.push(turnoCreado);

    selectCliente.selectedIndex = 0;
    selectTecnico.selectedIndex = 0;
    selectT.selectedIndex = 0;
    selectRango.selectedIndex = 0;
    selectEstadoTicket.selectedIndex = 0;

    turnosContainer.innerHTML = "";

    return turnoCreado;
  }

  // ================= EVENTS =================

  btnModoHistorial.onclick = () => {
    cambiarEstado(UI_STATE.HISTORIAL, {
      turnosContainer,
      historialContainer,
      selectorFecha,
      titulo: tituloSeccion
    });

    renderHistorialTurnos(turnos, historialContainer);
  };

  selectorFecha.onchange = async () => {
    const fecha = selectorFecha.value;
    if (!fecha) return;

    try {
      const turnosFecha = await obtenerTurnosPorFecha(fecha);

      cambiarEstado(UI_STATE.HISTORIAL, {
        turnosContainer,
        historialContainer,
        selectorFecha,
        titulo: tituloSeccion
      });

      renderHistorialTurnos(turnosFecha, historialContainer);

    } catch (e) {
      console.error("Error cargando historial por fecha:", e);
    }
  };

  btnMostrarTurnos.onclick = async () => {

    cambiarEstado(UI_STATE.DISPONIBILIDAD, {
      turnosContainer,
      historialContainer,
      selectorFecha,
      titulo: tituloSeccion
    });

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

    await renderGrillaTurnos({
      clienteId,
      tecnico,
      tSeleccionado,
      rangoSeleccionado,
      clientes,
      turnos,
      turnosContainer,
      estadoTicket,
      guardarTurno: guardarTurnoBackend,
      selects: {
        selectCliente,
        selectTecnico,
        selectTipoTurno: selectT,
        selectRango
      }
    });
  };

  // ================= INIT SELECTS =================

  renderSelectClientes(selectCliente, clientes, turnos);
  renderSelectTecnicos(selectTecnico, tecnicos);
  renderSelectGen(selectT, T_VALUES, "Seleccionar T", "T");
  renderSelectGen(selectRango, RANGOS, "Seleccionar rango", "");
  renderSelectGen(selectEstadoTicket, ["Abierto"], "Seleccionar estado", "");

  await cargarTurnosIniciales();

  cambiarEstado(UI_STATE.DISPONIBILIDAD, {
    turnosContainer,
    historialContainer,
    selectorFecha,
    titulo: tituloSeccion
  });
}