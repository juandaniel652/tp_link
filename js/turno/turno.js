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

  const clientes = await obtenerClientesBackend();
  const tecnicosData = await obtenerTecnicosBackend();
  const tecnicos = tecnicosData.map(t => new Tecnico(t));

  let turnos = [];

  const selectCliente = document.getElementById("selectCliente");
  const selectTecnico = document.getElementById("selectTecnico");
  const selectT = document.getElementById("selectT");
  const selectRango = document.getElementById("selectRango");
  const selectEstadoTicket = document.getElementById("selectEstadoTicket");

  const turnosContainer = document.getElementById("turnosContainer");
  const btnMostrarTurnos = document.getElementById("btnMostrarTurnos");

  // ============================
  // CARGAR TURNOS DESDE BACKEND
  // ============================

  async function cargarTurnosIniciales() {

    try {

      turnos = await obtenerTurnosBackend();

      renderHistorialTurnos(turnos, turnosContainer);

    } catch (error) {

      console.error(error);
      alert("Error cargando turnos");

    }

  }

  async function guardarTurnoBackend(turno) {

    const turnoCreado = await enviarTurno(turno);

    turnos.push(turnoCreado);

    renderHistorialTurnos(turnos, turnosContainer);

  }


  function actualizarSelectClientes(turnosActualizados) {

    renderSelectClientes(selectCliente, clientes, turnosActualizados);

  }

  // ============================
  // EVENTO PRINCIPAL
  // ============================

  btnMostrarTurnos.addEventListener("click", () => {

    const clienteId = selectCliente.value;
    const tecnicoId = selectTecnico.value;
    const tSeleccionado = selectT.value;
    const rangoSeleccionado = selectRango.value;
    const estadoTicket = selectEstadoTicket.value;

    if (!clienteId || !tecnicoId || !tSeleccionado || !rangoSeleccionado || !estadoTicket)

      return alert("Complete todos los campos");

    if (clienteYaTieneTurno(clienteId, turnos))
      return alert("Cliente ya tiene turno");

    const tecnico = tecnicos.find(t => t.id === tecnicoId);

    renderGrillaTurnos({

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

  });

  // ============================
  // RENDER SELECTS
  // ============================

  renderSelectClientes(selectCliente, clientes, turnos);

  renderSelectTecnicos(selectTecnico, tecnicos);

  renderSelectGen(selectT, T_VALUES, "Seleccionar T", "T");

  renderSelectGen(selectRango, RANGOS, "Seleccionar rango", "");

  renderSelectGen(selectEstadoTicket, ["Abierto"], "Seleccionar estado", "");

  // ============================

  await cargarTurnosIniciales();

  renderHistorialTurnos(turnos, turnosContainer);
});
