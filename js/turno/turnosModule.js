// main.js
import { renderTurnos, renderClientes, renderTecnicos, renderT, renderRango, renderEstadoTicket, renderNaps } from "./ui.js";
import { registrarEventos } from "./eventos.js";

document.addEventListener("DOMContentLoaded", () => {
  function inicializar() {
    renderTurnos();
    renderClientes();
    renderTecnicos();
    renderNaps();
    renderT();
    renderRango();
    renderEstadoTicket();

    const fechaInput = document.getElementById("turnoFecha");
    const today = new Date();
    const minDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
    fechaInput.min = minDate;

    registrarEventos();
  }

  inicializar();
});
