// js/src/modules/tecnicos/view/horarios.view.js

export class HorariosView {

  constructor(containerSelector, addBtnSelector) {
    this.container = document.querySelector(containerSelector);
    this.btnAdd = document.querySelector(addBtnSelector);
    this.horarios = [];
    this.bindEvents();
  }

  bindEvents() {
    if (this.btnAdd) {
      this.btnAdd.addEventListener("click", () => this.addHorario());
    }

    if (this.container) {
      this.container.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-delete-horario")) {
          const index = Number(e.target.dataset.index);
          this.horarios.splice(index, 1);
          this.render();
        }
      });
    }
  }

  addHorario(data = {}) {
    this.horarios.push({
      diaSemana: data.diaSemana ?? 1, // Lunes por defecto
      horaInicio: data.horaInicio ?? "09:00",
      horaFin: data.horaFin ?? "17:00"
    });
    this.render();
  }

  setHorarios(horarios) {
    // Solo lunes a sábado (1-6)
    this.horarios = (horarios || [])
      .filter(h => h.diaSemana >= 1 && h.diaSemana <= 6)
      .map(h => ({
        diaSemana: h.diaSemana ?? 1,
        horaInicio: h.horaInicio?.slice(0,5) || "09:00",
        horaFin: h.horaFin?.slice(0,5) || "17:00"
      }));
    this.render();
  }

  reset() {
    this.horarios = [];
    this.render();
  }

  getHorarios() {
    const rows = this.container.querySelectorAll(".horario-row");
    return Array.from(rows)
      .map(row => ({
        diaSemana: Number(row.querySelector(".dia").value) + 1, // Ajuste: 0->Lunes=1
        horaInicio: row.querySelector(".inicio").value,
        horaFin: row.querySelector(".fin").value
      }))
      .filter(h => h.horaInicio && h.horaFin)
      .filter(h => h.diaSemana >= 1 && h.diaSemana <= 6); // por si acaso
  }

  render() {
    if (!this.container) return;
    
    const dias = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
    
    this.container.innerHTML = this.horarios.map((h,i) => `
      <div class="horario-row">
        <select class="dia">
          ${dias.map((d,idx) => `
            <option value="${idx+1}" ${idx+1 === h.diaSemana ? "selected" : ""}>
              ${d}
            </option>
          `).join("")}
        </select>
        <input type="time" class="inicio" value="${h.horaInicio}">
        <input type="time" class="fin" value="${h.horaFin}">
        <button type="button" class="btn-delete-horario" data-index="${i}">❌</button>
      </div>
    `).join("");
  }
}