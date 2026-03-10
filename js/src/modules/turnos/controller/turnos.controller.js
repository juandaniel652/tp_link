// ============================================================
// turnos.controller.js — Controller principal del módulo
// ============================================================
// Migrado desde turno.js
// Orquesta: carga de datos, eventos DOM, delegación a servicios
// y vistas.
// ============================================================

import { T_VALUES, RANGOS }            from "../service/turnos.constants.js";
import { UI_STATE, cambiarEstado }     from "../state/turnos.state.js";
import { cargarTurnos, cargarTurnosPorFecha, guardarTurno }
                                        from "../service/turnos.service.js";
import {
  renderHistorialTurnos,
  inicializarSelectorFecha,
}                                       from "../view/turnos.historial.view.js";
import {
  renderSelectClientes,
  renderSelectTecnicos,
  renderSelectGen,
  renderGrillaTurnos,
}                                       from "../view/turnos.view.js";
import Tecnico          from "@/modules/tecnicos/model/tecnico.model.js";
import { fetchClientes }           from "@/modules/clientes/service/clientes.api.js";
import { tecnicosApi }             from "@/modules/tecnicos/service/tecnicos.api.js";
import { tokenStorage }            from "@/core/storage/tokenStorage.js";

// ============================================================
// Bootstrap — llamado desde main.js via initTurnos()
// ============================================================

export async function initTurnos() {

  // ----------------------------------------------------------
  // 1. Referencias DOM
  // ----------------------------------------------------------

  const tituloSeccion      = document.getElementById("tituloSeccion");
  const turnosContainer    = document.getElementById("turnosContainer");
  const historialContainer = document.getElementById("historialTurnos");
  const btnModoHistorial   = document.getElementById("btnModoHistorial");
  const selectorFecha      = document.getElementById("selectorFechaHistorial");
  const btnMostrarTurnos   = document.getElementById("btnMostrarTurnos");

  // Selects
  const selectTicket       = document.getElementById("selectTicket");
  const selectCliente      = document.getElementById("selectCliente");
  const selectTecnico      = document.getElementById("selectTecnico");
  const selectT            = document.getElementById("selectT");
  const selectRango        = document.getElementById("selectRango");
  const selectEstadoTicket = document.getElementById("selectEstadoTicket");

  const _refs = () => ({
    turnosContainer,
    historialContainer,
    selectorFecha,
    titulo: tituloSeccion,
  });

  const _selects = () => ({
    selectCliente,
    selectTecnico,
    selectTipoTurno: selectT,
    selectRango,
  });

  // ----------------------------------------------------------
  // 2. Cargar datos maestros
  // ----------------------------------------------------------

  const token        = tokenStorage.getToken();
  const clientes     = await fetchClientes(token);
  console.log("CLIENTES RAW:", clientes);
  const tecnicosData = await tecnicosApi.obtenerTodos();
  console.log("TECNICOS RAW:", tecnicosData);
  const tecnicos     = tecnicosData.map(t => new Tecnico(t));

  /** @type {Object[]} ViewModels de turnos activos */
  let turnos = [];

  // ----------------------------------------------------------
  // 3. Init selects
  // ----------------------------------------------------------

  renderSelectGen(selectTicket, [], "Seleccionar Ticket", "");
  renderSelectClientes(selectCliente, clientes, turnos);
  renderSelectTecnicos(selectTecnico, tecnicos);
  renderSelectGen(selectT, T_VALUES, "Seleccionar T", "T");
  renderSelectGen(selectRango, RANGOS, "Seleccionar Rango", "");
  renderSelectGen(selectEstadoTicket, ["Abierto"], "Seleccionar estado", "");

  // ----------------------------------------------------------
  // 3b. Preseleccionar desde URL params (viene de Agenda)
  // ----------------------------------------------------------

  const urlParams  = new URLSearchParams(window.location.search);
  const paramTecnico = urlParams.get("tecnico_id");
  const paramFecha   = urlParams.get("fecha");

  if (paramTecnico) {
    // Preseleccionar técnico
    selectTecnico.value = paramTecnico;
  }

  // ----------------------------------------------------------
  // 4. Carga inicial de turnos
  // ----------------------------------------------------------

  async function cargarTurnosIniciales() {
    try {
      turnos = await cargarTurnos();
      renderHistorialTurnos(turnos, historialContainer);
    } catch (e) {
      console.error("[controller] Error cargando turnos:", e);
    }
  }

  // ----------------------------------------------------------
  // 5. Guardar turno (orquestador local)
  // ----------------------------------------------------------

  /**
   * Llama al servicio, agrega el nuevo turno a la lista local
   * y devuelve el ViewModel creado.
   * @param {Object} turnoUI
   * @returns {Promise<Object>}
   */
  async function _guardarTurno(turnoUI) {
    const tecnico = tecnicos.find(t => String(t.id) === String(turnoUI.tecnico_id));
    const nuevoTurno = await guardarTurno(turnoUI, turnos, tecnico);
    turnos.push(nuevoTurno);
    return nuevoTurno;
  }

  // ----------------------------------------------------------
  // 6. Eventos
  // ----------------------------------------------------------

  // → Historial completo
  btnModoHistorial.onclick = () => {
    cambiarEstado(UI_STATE.HISTORIAL, _refs());
    renderHistorialTurnos(turnos, historialContainer, id => {
      turnos = turnos.filter(t => String(t.id) !== String(id));
    });
  };

  // → Historial filtrado por fecha
  selectorFecha.onchange = async () => {
    const fecha = selectorFecha.value;
    if (!fecha) return;

    try {
      const turnosFecha = await cargarTurnosPorFecha(fecha);
      cambiarEstado(UI_STATE.HISTORIAL, _refs());
      renderHistorialTurnos(turnosFecha, historialContainer);
    } catch (e) {
      console.error("[controller] Error historial por fecha:", e);
    }
  };

  // → Mostrar disponibilidad
  btnMostrarTurnos.onclick = async () => {
    const clienteId        = selectCliente.value;
    const tecnicoId        = selectTecnico.value;
    const tSeleccionado    = selectT.value;
    const rangoSeleccionado = selectRango.value;
    const estadoTicket     = selectEstadoTicket.value;

    if (!clienteId || !tecnicoId || !tSeleccionado || !rangoSeleccionado || !estadoTicket) {
      alert("Complete todos los campos");
      return;
    }

    cambiarEstado(UI_STATE.DISPONIBILIDAD, _refs());

    const tecnico = tecnicos.find(t => String(t.id) === String(tecnicoId));

    await renderGrillaTurnos({
      clienteId,
      tecnico,
      tSeleccionado,
      rangoSeleccionado,
      clientes,
      turnos,
      turnosContainer,
      estadoTicket,
      guardarTurno: _guardarTurno,
      selects:      _selects(),
    });
  };

  // ----------------------------------------------------------
  // 7. Estado inicial
  // ----------------------------------------------------------

  await cargarTurnosIniciales();

  cambiarEstado(UI_STATE.DISPONIBILIDAD, _refs());

  // ----------------------------------------------------------
  // 8. Auto-disparar si viene de Agenda con params
  // ----------------------------------------------------------
  
  if (paramTecnico) {
    // Esperar a que los selects estén listos y simular el click
    // El usuario solo elige el cliente y T, el técnico ya está
    selectTecnico.value = paramTecnico;
  
    // Si además viene fecha, mostrarla en el selector de historial
    // para referencia visual (opcional)
    if (paramFecha) {
      // Limpiar URL sin recargar para que quede prolijo
      const url = new URL(window.location.href);
      url.searchParams.delete("tecnico_id");
      url.searchParams.delete("fecha");
      window.history.replaceState({}, '', url);
    }
  }
}