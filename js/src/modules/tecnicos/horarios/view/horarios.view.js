// modules/tecnicos/horarios/view/horarios.view.js

const DIAS = [
  { value: 1, label: "Lunes"     },
  { value: 2, label: "Martes"    },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves"    },
  { value: 5, label: "Viernes"   },
  { value: 6, label: "Sábado"    }
];

/**
 * Gestiona la sub-sección de horarios dentro del formulario de técnicos.
 * Recibe el contenedor <div id="listaHorarios"> y el botón "Agregar horario".
 */
export default class HorariosView {

  /**
   * @param {HTMLElement} container  - contenedor donde se añaden las filas
   * @param {HTMLElement} btnAdd     - botón que dispara _agregarFila
   */
  constructor(container, btnAdd) {
    this.container = container;
    btnAdd.addEventListener("click", () => this.agregarFila());
  }

  // ── API pública ─────────────────────────────────────────────────────────────

  /** Añade una fila vacía o pre-rellena con datos de la API. */
  agregarFila(data = {}) {
    const row = document.createElement("div");
    row.classList.add("horario-row");

    row.innerHTML = `
      <select class="dia">
        ${DIAS.map(d => `<option value="${d.value}">${d.label}</option>`).join("")}
      </select>
      <input type="time" class="inicio" />
      <input type="time" class="fin"    />
      <button type="button" class="btn-delete">🗑️</button>
    `;

    if (data.dia_semana !== undefined)
      row.querySelector(".dia").value = data.dia_semana;

    if (data.hora_inicio)
      row.querySelector(".inicio").value = data.hora_inicio.slice(0, 5);

    if (data.hora_fin)
      row.querySelector(".fin").value = data.hora_fin.slice(0, 5);

    row.querySelector(".btn-delete").onclick = () => row.remove();

    this.container.appendChild(row);
  }

  /** Retorna el array de horarios listos para enviar a la API. */
  recopilar() {
    return Array.from(this.container.querySelectorAll(".horario-row"))
      .filter(row =>
        row.querySelector(".inicio").value &&
        row.querySelector(".fin").value
      )
      .map(row => ({
        dia_semana: Number(row.querySelector(".dia").value),
        hora_inicio: row.querySelector(".inicio").value + ":00",
        hora_fin:    row.querySelector(".fin").value   + ":00"
      }));
  }

  /** Limpia todas las filas del contenedor. */
  limpiar() {
    this.container.innerHTML = "";
  }

  /** Rellena las filas a partir de un array de horarios de la API. */
  cargar(horarios = []) {
    this.limpiar();
    horarios.forEach(h => this.agregarFila(h));
  }
}