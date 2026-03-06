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
      this.btnAdd.addEventListener("click", () => {
        this.addHorario();
      });
    }

    this.container.addEventListener("click", (e) => {

      if (e.target.classList.contains("btn-delete-horario")) {

        const index = e.target.dataset.index;
        this.horarios.splice(index, 1);

        this.render();
      }

    });
  }

  addHorario() {

    this.horarios.push({
      diaSemana: 1,
      horaInicio: "09:00",
      horaFin: "17:00"
    });

    this.render();
  }

  setHorarios(horarios) {
    this.horarios = horarios.map(h => ({
      diaSemana: h.diaSemana ?? 0,
      horaInicio: (h.horaInicio || "09:00").slice(0,5),
      horaFin: (h.horaFin || "17:00").slice(0,5)
    }));
    this.render();
  }

  reset() {

    this.horarios = [];
    this.render();

  }

  getHorarios() {
    const rows = this.container.querySelectorAll(".horario-row");
    const horarios = [];

    rows.forEach(row => {
      const dia = Number(row.querySelector(".dia").value);
      const inicio = row.querySelector(".inicio").value;
      const fin = row.querySelector(".fin").value;

      if (!inicio || !fin) return; // descartar filas vacías

      horarios.push({
        diaSemana: dia,
        horaInicio: inicio + ":00",
        horaFin: fin + ":00"
      });
    });

    return horarios;
  }

  validarSolapamientos(horarios) {

    const porDia = {};

    horarios.forEach(h => {

      if (!porDia[h.diaSemana]) {
        porDia[h.diaSemana] = [];
      }

      porDia[h.diaSemana].push(h);

    });

    for (const dia in porDia) {

      const lista = porDia[dia];

      lista.sort((a,b) => a.horaInicio.localeCompare(b.horaInicio));

      for (let i=0;i<lista.length-1;i++) {

        const actual = lista[i];
        const siguiente = lista[i+1];

        if (actual.horaFin > siguiente.horaInicio) {

          throw new Error(
            "Los horarios se solapan en el mismo día"
          );

        }

      }

    }

  }

  render() {

    if (!this.container) return;

    const dias = [
      "Domingo","Lunes","Martes","Miércoles",
      "Jueves","Viernes","Sábado"
    ];

    this.container.innerHTML = this.horarios.map((h,i)=>`

      <div class="horario-row">

        <select class="dia">

          ${dias.map((d,idx)=>`
            <option value="${idx}" ${idx===h.diaSemana ? "selected":""}>
              ${d}
            </option>
          `).join("")}

        </select>

        <input type="time" class="inicio" value="${h.horaInicio}">

        <input type="time" class="fin" value="${h.horaFin}">

        <button 
          type="button"
          class="btn-delete-horario"
          data-index="${i}">
          ❌
        </button>

      </div>

    `).join("");

  }

}