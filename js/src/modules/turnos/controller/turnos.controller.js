// ============================================================
// turnos.controller.js — Controller principal del módulo
// ============================================================

import { ToastService }            from "@/ui/ToastService.js";
import { clienteYaTieneTurno }     from "../service/disponibilidad.service.js";
import { T_VALUES, RANGOS }        from "../service/turnos.constants.js";
import { UI_STATE, cambiarEstado } from "../state/turnos.state.js";
import { cargarTurnos, cargarTurnosPorFecha, guardarTurno }
                                   from "../service/turnos.service.js";
import { renderHistorialTurnos }   from "../view/turnos.historial.view.js";
import {
  renderSelectClientes,
  renderSelectTecnicos,
  renderSelectGen,
  renderGrillaTurnos,
}                                  from "../view/turnos.view.js";
import Tecnico         from "@/modules/tecnicos/model/tecnico.model.js";
import { fetchClientes }      from "@/modules/clientes/service/clientes.api.js";
import { tecnicosApi }        from "@/modules/tecnicos/service/tecnicos.api.js";
import { tokenStorage }       from "@/core/storage/tokenStorage.js";

// ============================================================
// Bootstrap
// ============================================================

export async function initTurnos() {

  // ----------------------------------------------------------
  // 1. Referencias DOM
  // ----------------------------------------------------------

  const tituloSeccion      = document.getElementById("tituloSeccion");
  const turnosContainer    = document.getElementById("turnosContainer");
  const historialContainer = document.getElementById("historialTurnos");
  const btnModoHistorial   = document.getElementById("btnModoHistorial");
  const mesAnioWrapper     = document.getElementById("mesAnioPickerWrapper");
  const labelMesAnio       = document.getElementById("labelMesAnio");
  const btnMesAnterior     = document.getElementById("btnMesAnterior");
  const btnMesSiguiente    = document.getElementById("btnMesSiguiente");
  const btnMostrarTurnos   = document.getElementById("btnMostrarTurnos");

  const selectTicket       = document.getElementById("selectTicket");
  const selectCliente      = document.getElementById("selectCliente");
  const selectTecnico      = document.getElementById("selectTecnico");
  const selectT            = document.getElementById("selectT");
  const selectRango        = document.getElementById("selectRango");
  const selectEstadoTicket = document.getElementById("selectEstadoTicket");

  let _pickerDate            = new Date();
  let turnos                 = [];
  let _currentHistorialActivo = false;

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
  const tecnicosData = await tecnicosApi.obtenerTodos();
  const tecnicos     = tecnicosData.map(t => new Tecnico(t));

  // ----------------------------------------------------------
  // 3. Init selects (render inicial vacío)
  // ----------------------------------------------------------

  renderSelectGen(selectTicket, [], "Seleccionar Ticket", "");
  renderSelectTecnicos(selectTecnico, tecnicos);
  renderSelectGen(selectT, T_VALUES, "Seleccionar T", "T");
  renderSelectGen(selectRango, RANGOS, "Seleccionar Rango", "");
  renderSelectGen(selectEstadoTicket, ["Abierto"], "Seleccionar Estado", "");

  // ----------------------------------------------------------
  // 3b. URL params (viene de Agenda)
  // ----------------------------------------------------------

  const urlParams    = new URLSearchParams(window.location.search);
  const paramTecnico = urlParams.get("tecnico_id");
  const paramFecha   = urlParams.get("fecha");

  if (paramTecnico) selectTecnico.value = paramTecnico;

  // ----------------------------------------------------------
  // 4. Helper — refrescar turnos desde backend y re-renderizar select
  // ← DENTRO de initTurnos para acceder a turnos/clientes/selectCliente
  // ----------------------------------------------------------

  async function _refrescarTurnos() {
    turnos = await cargarTurnos();

    console.log("TURNOS TRAS REFRESH:", turnos.map(t => ({ 
      clienteId: t.clienteId, 
      estado: t.estado 
    })));
    renderSelectClientes(selectCliente, clientes, turnos);
  }

  // ----------------------------------------------------------
  // 5. Carga inicial
  // ----------------------------------------------------------

  async function cargarTurnosIniciales() {
    try {
      await _refrescarTurnos();
      renderHistorialTurnos(turnos, historialContainer);
    } catch (e) {
      console.error("[controller] Error cargando turnos:", e);
    }
  }

  // ----------------------------------------------------------
  // 6. Guardar turno
  // ----------------------------------------------------------

  async function _guardarTurno(turnoUI) {
    const tecnico = tecnicos.find(t => String(t.id) === String(turnoUI.tecnico_id));
    
    if (!tecnico) {
      ToastService.error("El técnico seleccionado ya no está disponible.");
      return;
    }
  
    const nuevoTurno = await guardarTurno(turnoUI, turnos, tecnico);
    turnos.push(nuevoTurno);
    return nuevoTurno;
  }

  // ----------------------------------------------------------
  // 7. Picker mes/año
  // ----------------------------------------------------------

  const MESES = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
  ];

  function _actualizarLabel() {
    labelMesAnio.textContent =
      `${MESES[_pickerDate.getMonth()]} ${_pickerDate.getFullYear()}`;
  }

  function _diasDelMes(year, month) {
    const dias  = [];
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

      grupos.forEach(({ turnos: turnosDia }) => {
        const wrapper = document.createElement("div");
        wrapper.className = "historial-turnos";
        historialContainer.appendChild(wrapper);

        // ← async callback para poder usar await
        renderHistorialTurnos(turnosDia, wrapper, async id => {
          await _refrescarTurnos(); // ← actualiza turnos y select
          // sin _cargarMes() — la card ya se sacó del DOM en tiempo real
        });
      });

    } catch (e) {
      console.error("[controller] Error cargando mes:", e);
      historialContainer.innerHTML =
        `<p>Error al cargar los turnos. Intentá de nuevo.</p>`;
    }
  }

  // ----------------------------------------------------------
  // 8. Popup selector rápido mes/año
  // ----------------------------------------------------------

  function _crearPopupMesAnio() {
    document.getElementById("mesAnioPopup")?.remove();

    let añoVista = _pickerDate.getFullYear();

    const popup = document.createElement("div");
    popup.id        = "mesAnioPopup";
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
              class="popup-mes-btn ${i === _pickerDate.getMonth() && añoVista === _pickerDate.getFullYear() ? "popup-mes-activo" : ""}"
              data-mes="${i}">
              ${m.slice(0, 3)}
            </button>
          `).join("")}
        </div>
      `;

      popup.querySelector("#popupAnioAnterior").onclick = e => {
        e.stopPropagation(); añoVista--; _renderPopup();
      };
      popup.querySelector("#popupAnioSiguiente").onclick = e => {
        e.stopPropagation(); añoVista++; _renderPopup();
      };
      popup.querySelectorAll(".popup-mes-btn").forEach(btn => {
        btn.onclick = e => {
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

    const rect = mesAnioWrapper.getBoundingClientRect();
    popup.style.top  = `${rect.bottom + window.scrollY + 6}px`;
    popup.style.left = `${rect.left + window.scrollX}px`;
    document.body.appendChild(popup);

    setTimeout(() => {
      document.addEventListener("click", function _cerrar() {
        popup.remove();
        document.removeEventListener("click", _cerrar);
      });
    }, 0);
  }

  // ----------------------------------------------------------
  // 9. Eventos
  // ----------------------------------------------------------

  _actualizarLabel();

  btnModoHistorial.onclick = () => {
    _currentHistorialActivo = true;
    _actualizarLabel();
    _cargarMes();
  };

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

  document.getElementById("btnCalendarioRapido").addEventListener("click", e => {
    e.stopPropagation();
    _crearPopupMesAnio();
  });

  btnMostrarTurnos.onclick = async () => {
    const clienteId         = selectCliente.value;
    const tecnicoId         = selectTecnico.value;
    const tSeleccionado     = selectT.value;
    const rangoSeleccionado = selectRango.value;
    const estadoTicket      = selectEstadoTicket.value;

    if (!clienteId || !tecnicoId || !tSeleccionado || !rangoSeleccionado || !estadoTicket) {
      ToastService.error("Complete todos los campos");
      return;
    }

    if (clienteYaTieneTurno(clienteId, turnos)) {
      ToastService.error("Este cliente ya tiene un turno activo. Editalo desde el Historial.");
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
  // 10. Estado inicial
  // ----------------------------------------------------------

  await cargarTurnosIniciales();
  cambiarEstado(UI_STATE.DISPONIBILIDAD, _refs());

  // ----------------------------------------------------------
  // 11. Auto-disparar si viene de Agenda
  // ----------------------------------------------------------

  if (paramTecnico) {
    selectTecnico.value = paramTecnico;
    if (paramFecha) {
      const url = new URL(window.location.href);
      url.searchParams.delete("tecnico_id");
      url.searchParams.delete("fecha");
      window.history.replaceState({}, "", url);
    }
  }
}