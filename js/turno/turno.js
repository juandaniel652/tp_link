//Fue reemplazado, por ende puede cambiarse sin problemas, aunque se mantuvo para no romper la estructura actual del proyecto. La idea es que este archivo sea el punto de entrada de la app, y que luego se vayan importando los módulos necesarios (renderizado, api, validaciones, etc).

import { T_VALUES, RANGOS } from "./constantes.js";

import { TurnosService } 
  from "../src/modules/turnos/service/turnos.service.js";

import {
  cambiarEstado,
  UI_STATE
} from "./uiState.js";

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
  // DOM
  // ============================

  const tituloSeccion = document.getElementById("tituloSeccion");

  const turnosContainer = document.getElementById("turnosContainer");

  const historialContainer =
    document.getElementById("historialTurnos");

  const btnModoHistorial =
    document.getElementById("btnModoHistorial");

  const selectorFecha =
    document.getElementById("selectorFechaHistorial");

  const btnMostrarTurnos =
    document.getElementById("btnMostrarTurnos");

  // selects

  const selectCliente =
    document.getElementById("selectCliente");

  const selectTecnico =
    document.getElementById("selectTecnico");

  const selectT =
    document.getElementById("selectT");

  const selectRango =
    document.getElementById("selectRango");

  const selectEstadoTicket =
    document.getElementById("selectEstadoTicket");


  // ============================
  // DATA
  // ============================

  const clientes =
    await obtenerClientesBackend();

  const tecnicosData =
    await obtenerTecnicosBackend();

  const tecnicos =
    tecnicosData.map(t => new Tecnico(t));

  let turnos = [];


  // ============================
  // CARGAR TURNOS INICIALES
  // ============================

  async function cargarTurnosIniciales(){

    try{

      turnos = await obtenerTurnosBackend();

      // preparar historial (no visible aún)

      renderHistorialTurnos(
        turnos,
        historialContainer
      );

    }
    catch(e){

      console.error(
        "Error cargando turnos:",
        e
      );

    }

  }


  // ============================
  // GUARDAR TURNO
  // ============================

  async function guardarTurnoBackend(turnoUI){

    try {
    
      // 🔥 CONVERTIMOS A DOMINIO
      const datosDominio = {
        clienteId: turnoUI.cliente_id,
        tecnicoId: turnoUI.tecnico_id,
        fecha: turnoUI.fecha,
        inicio: parseInt(turnoUI.hora_inicio),
        fin: parseInt(turnoUI.hora_fin)
      };
    
      // 🔥 VALIDAMOS CON DOMINIO
      TurnosService.validarNuevoTurno(
        turnos.map(t => ({
          clienteId: t.cliente_id,
          tecnicoId: t.tecnico_id,
          fecha: t.fecha,
          inicio: parseInt(t.hora_inicio),
          fin: parseInt(t.hora_fin)
        })),
        datosDominio
      );
    
    } catch (e) {
    
      alert(e.message);
      return;
    
    }
  
    // 🔥 RECIÉN AHORA ENVIAMOS AL BACKEND
    const turnoCreado =
      await enviarTurno(turnoUI);
  
    turnos.push(turnoCreado);
  
    return turnoCreado;
  }


  // ============================
  // BOTÓN HISTORIAL
  // ============================

  btnModoHistorial.onclick = () => {

    cambiarEstado(
      UI_STATE.HISTORIAL,
      {
        turnosContainer,
        historialContainer,
        selectorFecha,
        titulo: tituloSeccion
      }
    );

    renderHistorialTurnos(
      turnos,
      historialContainer
    );

  };


  // ============================
  // HISTORIAL POR FECHA
  // ============================

  selectorFecha.onchange = async () => {

    const fecha = selectorFecha.value;

    if(!fecha) return;

    try{

      const turnosFecha =
        await obtenerTurnosPorFecha(fecha);

      cambiarEstado(
        UI_STATE.HISTORIAL,
        {
          turnosContainer,
          historialContainer,
          selectorFecha,
          titulo: tituloSeccion
        }
      );

      renderHistorialTurnos(
        turnosFecha,
        historialContainer
      );

    }
    catch(e){

      console.error(
        "Error cargando historial por fecha:",
        e
      );

    }

  };


  // ============================
  // MOSTRAR DISPONIBILIDAD
  // ============================

  btnMostrarTurnos.onclick = async () => {

    cambiarEstado(
      UI_STATE.DISPONIBILIDAD,
      {
        turnosContainer,
        historialContainer,
        selectorFecha,
        titulo: tituloSeccion
      }
    );

    const clienteId =
      selectCliente.value;

    const tecnicoId =
      selectTecnico.value;

    const tSeleccionado =
      selectT.value;

    const rangoSeleccionado =
      selectRango.value;

    const estadoTicket =
      selectEstadoTicket.value;


    if(
      !clienteId ||
      !tecnicoId ||
      !tSeleccionado ||
      !rangoSeleccionado ||
      !estadoTicket
    ){

      alert(
        "Complete todos los campos"
      );

      return;

    }


    const tecnico =
      tecnicos.find(
        t => t.id === tecnicoId
      );


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


  // ============================
  // INIT SELECTS
  // ============================

  renderSelectClientes(
    selectCliente,
    clientes,
    turnos
  );

  renderSelectTecnicos(
    selectTecnico,
    tecnicos
  );

  renderSelectGen(
    selectT,
    T_VALUES,
    "Seleccionar T",
    "T"
  );

  renderSelectGen(
    selectRango,
    RANGOS,
    "Seleccionar rango",
    ""
  );

  renderSelectGen(
    selectEstadoTicket,
    ["Abierto"],
    "Seleccionar estado",
    ""
  );


  // ============================
  // INIT APP
  // ============================

  await cargarTurnosIniciales();

  cambiarEstado(
    UI_STATE.DISPONIBILIDAD,
    {
      turnosContainer,
      historialContainer,
      selectorFecha,
      titulo: tituloSeccion
    }
  );

});