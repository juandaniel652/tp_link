// js/src/modules/disponibilidad/view/disponibilidad.view.js
export class DisponibilidadView {

  constructor(formSelector, containerSelector) {
    this.form = document.querySelector(formSelector);
    this.container = document.querySelector(containerSelector);

    this.horariosContainer = this.form.querySelector(containerSelector);
    this.btnAddHorario = this.form.querySelector("#addHorario");

    this.btnAddHorario.addEventListener("click", () => this.agregarFilaHorario());
  }

  // =========================
  // AGREGAR FILA DE HORARIO
  // =========================
  agregarFilaHorario(data = {}) {
    const row = document.createElement("div");
    row.classList.add("horario-row");

    row.innerHTML = `
      <select class="dia">
        <option value="0">Domingo</option>
        <option value="1">Lunes</option>
        <option value="2">Martes</option>
        <option value="3">Miércoles</option>
        <option value="4">Jueves</option>
        <option value="5">Viernes</option>
        <option value="6">Sábado</option>
      </select>
      <input type="time" class="inicio">
      <input type="time" class="fin">
      <button type="button" class="remove">🗑️</button>
    `;

    // Rellenar datos si vienen desde un técnico existente
    if (data.diaSemana !== undefined) row.querySelector(".dia").value = data.diaSemana;
    if (data.horaInicio) row.querySelector(".inicio").value = data.horaInicio.slice(0,5);
    if (data.horaFin) row.querySelector(".fin").value = data.horaFin.slice(0,5);

    row.querySelector(".remove").addEventListener("click", () => row.remove());

    this.horariosContainer.appendChild(row);
  }

  // =========================
  // RECOPILAR HORARIOS
  // =========================
  recopilarHorarios() {
    const rows = this.horariosContainer.querySelectorAll(".horario-row");
    return Array.from(rows)
      .filter(row => row.querySelector(".inicio").value && row.querySelector(".fin").value)
      .map(row => ({
        diaSemana: Number(row.querySelector(".dia").value),
        horaInicio: row.querySelector(".inicio").value + ":00",
        horaFin: row.querySelector(".fin").value + ":00"
      }));
  }

  // =========================
  // RESET UI
  // =========================
  reset() {
    this.horariosContainer.innerHTML = "";
  }

  // =========================
  // RENDER HORARIOS EXISTENTES
  // =========================
  renderHorarios(horarios) {
    this.reset();
    horarios.forEach(h => this.agregarFilaHorario(h));
  }
}