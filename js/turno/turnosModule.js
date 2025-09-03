import { 
  renderTurnos, 
  renderClientes, 
  renderTecnicos, 
  renderT, 
  renderRango, 
  renderEstadoTicket, 
  renderNaps, 
  activarBotonManual 
} from "./ui.js";
import { registrarEventos } from "./eventos.js";

document.addEventListener("DOMContentLoaded", () => {
  function inicializar() {
    // Renderizamos primero todos los elementos del formulario
    renderTurnos();
    renderClientes();
    renderTecnicos();
    renderNaps();
    renderT();
    renderRango();
    renderEstadoTicket();
    activarBotonManual();

    // Ahora sí existe el formulario
    registrarEventos();

    // Configuración mínima de fecha
    const fechaInput = document.getElementById("turnoFecha");
    if (fechaInput) {
      const today = new Date();
      fechaInput.min = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
    }

    // === Filtrar técnicos por NAP ===
    const selectNap = document.getElementById("selectNap");
    const selectTecnico = document.getElementById("selectTecnico");

    function cargarNaps() {
      const puntos = JSON.parse(localStorage.getItem("puntosAcceso")) || [];
      selectNap.innerHTML = '<option value="">Seleccionar Punto de Acceso</option>';

      puntos.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.numero;
        opt.textContent = `NAP ${p.numero}`;
        selectNap.appendChild(opt);
      });
    }

    function cargarTecnicosPorNap(napSeleccionado) {
      const tecnicos = JSON.parse(localStorage.getItem("tecnicos")) || [];
      selectTecnico.innerHTML = '<option value="">Seleccionar Técnico</option>';

      tecnicos
        .filter(t => t.puntosAcceso.includes(parseInt(napSeleccionado)))
        .forEach(t => {
          const opt = document.createElement("option");
          opt.value = `${t.nombre} ${t.apellido}`;
          opt.textContent = `${t.nombre} ${t.apellido}`;
          selectTecnico.appendChild(opt);
        });
    }

    selectNap.addEventListener("change", () => {
      const napSeleccionado = selectNap.value;
      if (napSeleccionado) {
        cargarTecnicosPorNap(napSeleccionado);
      } else {
        selectTecnico.innerHTML = '<option value="">Seleccionar Técnico</option>';
      }
    });

    // Inicializar al cargar módulo de turnos
    cargarNaps();
  }

  inicializar();
});
