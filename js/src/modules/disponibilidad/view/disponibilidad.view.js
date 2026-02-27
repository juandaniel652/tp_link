// js/src/modules/disponibilidad/view/disponibilidad.view.js
export class DisponibilidadView {

  constructor(formSelector, containerSelector) {
    this.form = document.querySelector(formSelector);
    this.container = document.querySelector(containerSelector);

    this.btnAddHorario = this.form.querySelector("#addHorario");
    this.horariosContainer = this.form.querySelector("#listaHorarios");

    this.btnAddHorario.addEventListener("click", () => this.agregarFilaHorario());
  }

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

    if (data.diaSemana !== undefined) row.querySelector(".dia").value = data.diaSemana;
    if (data.horaInicio) row.querySelector(".inicio").value = data.horaInicio.slice(0,5);
    if (data.horaFin) row.querySelector(".fin").value = data.horaFin.slice(0,5);

    row.querySelector(".remove").onclick = () => row.remove();

    this.horariosContainer.appendChild(row);
  }

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

  reset() {
    this.horariosContainer.innerHTML = "";
  }

  renderHorarios(horarios) {
    this.reset();
    horarios.forEach(h => this.agregarFilaHorario(h));
  }
}