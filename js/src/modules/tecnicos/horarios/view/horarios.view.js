// modules/tecnicos/horarios/view/horarios.view.js

const DIAS = [
  { value: 1, label: "Lunes"     },
  { value: 2, label: "Martes"    },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves"    },
  { value: 5, label: "Viernes"   },
  { value: 6, label: "Sábado"    }
];

export default class HorariosView {

  constructor(container, btnAdd) {
    this.container = container;
    btnAdd.addEventListener("click", () => this.agregarFila());
  }

  // ── API pública ─────────────────────────────────────────────────────────────

  agregarFila(data = {}) {
    const row = document.createElement("div");
    row.classList.add("horario-row");

    row.innerHTML = `
      <select class="dia">
        ${DIAS.map(d => `<option value="${d.value}">${d.label}</option>`).join("")}
      </select>
      <input type="time" class="inicio" />
      <input type="time" class="fin"    />
      <button type="button" class="btn-delete" title="Eliminar horario">🗑️</button>
      <span class="horario-error"></span>
    `;

    if (data.dia_semana !== undefined)
      row.querySelector(".dia").value = data.dia_semana;

    if (data.hora_inicio)
      row.querySelector(".inicio").value = data.hora_inicio.slice(0, 5);

    if (data.hora_fin)
      row.querySelector(".fin").value = data.hora_fin.slice(0, 5);

    // Limpiar error al corregir
    row.querySelector(".inicio").addEventListener("change", () => this._limpiarErrorFila(row));
    row.querySelector(".fin").addEventListener("change",    () => this._limpiarErrorFila(row));

    row.querySelector(".btn-delete").onclick = () => row.remove();

    this.container.appendChild(row);
  }

  /**
   * Valida todas las filas y retorna el array de horarios si son válidos,
   * o null si hay algún error (marcando los errores inline).
   */
  recopilarYValidar() {
    const rows = Array.from(this.container.querySelectorAll(".horario-row"));
    let valido = true;

    const horarios = [];

    rows.forEach(row => {
      const inicio = row.querySelector(".inicio").value;
      const fin    = row.querySelector(".fin").value;
      const error  = row.querySelector(".horario-error");

      if (!inicio && !fin) {
        // Fila completamente vacía → la ignoramos pero no bloqueamos
        row.remove();
        return;
      }

      if (!inicio) {
        this._mostrarErrorFila(row, "Falta la hora de inicio.");
        valido = false;
        return;
      }

      if (!fin) {
        this._mostrarErrorFila(row, "Falta la hora de fin.");
        valido = false;
        return;
      }

      if (fin <= inicio) {
        this._mostrarErrorFila(row, "La hora de fin debe ser mayor que la de inicio.");
        valido = false;
        return;
      }

      this._limpiarErrorFila(row);

      horarios.push({
        dia_semana:  Number(row.querySelector(".dia").value),
        hora_inicio: inicio + ":00",
        hora_fin:    fin    + ":00"
      });
    });

    return valido ? horarios : null;
  }

  limpiar() {
    this.container.innerHTML = "";
  }

  cargar(horarios = []) {
    this.limpiar();
    horarios.forEach(h => this.agregarFila(h));
  }

  // ── Helpers privados ─────────────────────────────────────────────────────────

  _mostrarErrorFila(row, mensaje) {
    const span = row.querySelector(".horario-error");
    if (span) span.textContent = mensaje;
    row.classList.add("horario-row--error");
  }

  _limpiarErrorFila(row) {
    const span = row.querySelector(".horario-error");
    if (span) span.textContent = "";
    row.classList.remove("horario-row--error");
  }
}