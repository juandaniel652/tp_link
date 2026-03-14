// ============================================================
// turnos.controller.js — Controller principal del módulo
// ============================================================
// Migrado desde turno.js
// Orquesta: carga de datos, eventos DOM, delegación a servicios
// y vistas.
// ============================================================

// En turnos.controller.js, en los imports de disponibilidad
import { clienteYaTieneTurno } from "../service/disponibilidad.service.js";
import { T_VALUES, RANGOS }            from "../service/turnos.constants.js";
import { UI_STATE, cambiarEstado }     from "../state/turnos.state.js";
import { cargarTurnos, cargarTurnosPorFecha, guardarTurno }
                                        from "../service/turnos.service.js";
import {
  renderHistorialTurnos,
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
  const mesAnioWrapper  = document.getElementById("mesAnioPickerWrapper");
  const labelMesAnio    = document.getElementById("labelMesAnio");
  const btnMesAnterior  = document.getElementById("btnMesAnterior");
  const btnMesSiguiente = document.getElementById("btnMesSiguiente");
  const btnMostrarTurnos   = document.getElementById("btnMostrarTurnos");

  let _pickerDate = new Date();

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
    selectorFecha: mesAnioWrapper,
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
  let _currentHistorialActivo = false;

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
    _currentHistorialActivo = true;   // ← afuera, al hacer click
    _actualizarLabel();
    _cargarMes();                     // ← carga el mes inmediatamente
  };

  // → Historial filtrado por fecha
  // ----------------------------------------------------------
  // Picker mes/año — helpers
  // ----------------------------------------------------------


  const MESES = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];

  function _actualizarLabel() {
    labelMesAnio.textContent =
      `${MESES[_pickerDate.getMonth()]} ${_pickerDate.getFullYear()}`;
  }

  function _diasDelMes(year, month) {
    const dias = [];
    const total = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= total; d++) {
      const mm = String(month + 1).padStart(2, "0");
      const dd = String(d).padStart(2, "0");
      dias.push(`${year}-${mm}-${dd}`);
    }
    return dias;
  }

  async function _cargarMes() {
    cambiarEstado(UI_STATE.HISTORIAL, _refs());
    historialContainer.innerHTML =
      `<div class="historial-loading">⏳ Cargando turnos de ${labelMesAnio.textContent}...</div>`;

    const year  = _pickerDate.getFullYear();
    const month = _pickerDate.getMonth();
    const dias  = _diasDelMes(year, month);

    try {
      const resultados = await Promise.all(
        dias.map(f => cargarTurnosPorFecha(f).catch(() => []))
      );

      const grupos = dias
        .map((fecha, i) => ({ fecha, turnos: resultados[i] }))
        .filter(g => g.turnos.length > 0);

      historialContainer.innerHTML = "";

      if (!grupos.length) {
        historialContainer.innerHTML =
          `<p>No hay turnos en ${labelMesAnio.textContent}</p>`;
        return;
      }

      // ← SIN títulos de fecha entre grupos, solo las cards
      grupos.forEach(({ turnos: turnosDia }) => {
        const wrapper = document.createElement("div");
        wrapper.className = "historial-turnos";
        historialContainer.appendChild(wrapper);

        renderHistorialTurnos(turnosDia, wrapper, id => {
          turnos = turnos.filter(t => String(t.id) !== String(id));
          renderSelectClientes(selectCliente, clientes, turnos);
          _cargarMes();
        });
      });

    } catch (e) {
      console.error("[controller] Error cargando mes:", e);
      historialContainer.innerHTML =
        `<p>Error al cargar los turnos. Intentá de nuevo.</p>`;
    }
  }

  // ----------------------------------------------------------
  // Popup selector rápido mes/año (estilo corporativo)
  // ----------------------------------------------------------

  function _crearPopupMesAnio() {
    // Evitar duplicados
    document.getElementById("mesAnioPopup")?.remove();

    const añoActual = _pickerDate.getFullYear();
    let añoVista    = añoActual; // año que se está viendo en el popup

    const popup = document.createElement("div");
    popup.id = "mesAnioPopup";
    popup.className = "mes-anio-popup";

    function _renderPopup() {
      popup.innerHTML = `
        <div class="popup-header">
          <button type="button" class="popup-anio-nav" id="popupAnioAnterior">&#8249;</button>
          <span class="popup-anio-label">${añoVista}</span>
          <button type="button" class="popup-anio-nav" id="popupAnioSiguiente">&#8250;</button>
        </div>
        <div class="popup-meses">
          ${MESES.map((m, i) => `
            <button type="button"
              class="popup-mes-btn ${i === _pickerDate.getMonth() && añoVista === _pickerDate.getFullYear() ? 'popup-mes-activo' : ''}"
              data-mes="${i}">
              ${m.slice(0, 3)}
            </button>
          `).join("")}
        </div>
      `;

      popup.querySelector("#popupAnioAnterior").onclick = (e) => {
        e.stopPropagation();
        añoVista--;
        _renderPopup();
      };
      popup.querySelector("#popupAnioSiguiente").onclick = (e) => {
        e.stopPropagation();
        añoVista++;
        _renderPopup();
      };
      popup.querySelectorAll(".popup-mes-btn").forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          _pickerDate.setFullYear(añoVista);
          _pickerDate.setMonth(Number(btn.dataset.mes));
          _actualizarLabel();
          popup.remove();
          if (_currentHistorialActivo) _cargarMes();
        };
      });
    }

    _renderPopup();

    // Posicionar bajo el wrapper
    const rect = mesAnioWrapper.getBoundingClientRect();
    popup.style.top  = `${rect.bottom + window.scrollY + 6}px`;
    popup.style.left = `${rect.left + window.scrollX}px`;

    document.body.appendChild(popup);

    // Cerrar al clickear afuera
    setTimeout(() => {
      document.addEventListener("click", function _cerrar() {
        popup.remove();
        document.removeEventListener("click", _cerrar);
      });
    }, 0);
  }

  // → Navegación del picker (flechas rápidas para ±1 mes)
  _actualizarLabel();

  btnMesAnterior.addEventListener("click", () => {
    _pickerDate.setMonth(_pickerDate.getMonth() - 1);
    _actualizarLabel();
    if (_currentHistorialActivo) _cargarMes();
  });

  btnMesSiguiente.addEventListener("click", () => {
    _pickerDate.setMonth(_pickerDate.getMonth() + 1);
    _actualizarLabel();
    if (_currentHistorialActivo) _cargarMes();
  });

  // → Ícono calendario abre popup
  document.getElementById("btnCalendarioRapido").addEventListener("click", (e) => {
    e.stopPropagation();
    _crearPopupMesAnio();
  });

  // → Mostrar disponibilidad
  btnMostrarTurnos.onclick = async () => {
    const clienteId         = selectCliente.value;
    const tecnicoId         = selectTecnico.value;
    const tSeleccionado     = selectT.value;
    const rangoSeleccionado = selectRango.value;
    const estadoTicket      = selectEstadoTicket.value;
    
    if (!clienteId || !tecnicoId || !tSeleccionado || !rangoSeleccionado || !estadoTicket) {
      alert("Complete todos los campos");
      return;
    }
  
    // ← Segunda capa: bloqueo por turno activo
    if (clienteYaTieneTurno(clienteId, turnos)) {
      alert("⚠️ Este cliente ya tiene un turno activo. Editalo desde el Historial.");
      return; // ← este return es el que faltaba
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