// modules/tecnicos/horarios/view/horarios.view.js

const DIAS = [
  { value: 1, label: "Lun", full: "Lunes"     },
  { value: 2, label: "Mar", full: "Martes"    },
  { value: 3, label: "Mié", full: "Miércoles" },
  { value: 4, label: "Jue", full: "Jueves"    },
  { value: 5, label: "Vie", full: "Viernes"   },
  { value: 6, label: "Sáb", full: "Sábado"    },
  { value: 0, label: "Dom", full: "Domingo"   }
];

export default class HorariosView {

  constructor(container, btnAdd) {
    // btnAdd ya no se usa — el nuevo UI no necesita "agregar fila"
    // lo ocultamos para no romper el HTML existente
    btnAdd.style.display = "none";

    this.container = container;
    this._render();
  }

  // ── Render inicial ───────────────────────────────────────────────────────────

  _render() {
    this.container.innerHTML = `
      <div class="hs-wrap">

        <!-- Chips de días -->
        <div class="hs-chips" role="group" aria-label="Seleccionar días">
          ${DIAS.map(d => `
            <button type="button" class="hs-chip" data-dia="${d.value}" aria-pressed="false">
              ${d.label}
            </button>
          `).join("")}
        </div>

        <!-- Panel de rango global -->
        <div class="hs-global">
          <span class="hs-global-label">Rango global</span>
          <div class="hs-global-inputs">
            <input type="time" id="hs-global-inicio" value="09:00" />
            <span class="hs-sep">→</span>
            <input type="time" id="hs-global-fin"    value="17:00" />
            <button type="button" class="hs-apply-btn" id="hs-apply">
              Aplicar a seleccionados
            </button>
          </div>
        </div>

        <!-- Filas por día (se generan dinámicamente) -->
        <div class="hs-rows" id="hs-rows"></div>

        <!-- Error general -->
        <p class="field-error" id="hs-error"></p>

      </div>
    `;

    this._rows     = this.container.querySelector("#hs-rows");
    this._error    = this.container.querySelector("#hs-error");
    this._chips    = this.container.querySelectorAll(".hs-chip");
    this._gInicio  = this.container.querySelector("#hs-global-inicio");
    this._gFin     = this.container.querySelector("#hs-global-fin");
    this._applyBtn = this.container.querySelector("#hs-apply");

    // Estado: dia_semana → { inicio, fin }
    this._selected = new Map();

    this._bindChips();
    this._applyBtn.addEventListener("click", () => this._aplicarGlobal());
  }

  // ── Chips ────────────────────────────────────────────────────────────────────

  _bindChips() {
    this._chips.forEach(chip => {
      chip.addEventListener("click", () => {
        const dia = Number(chip.dataset.dia);
        const active = chip.classList.toggle("hs-chip--active");
        chip.setAttribute("aria-pressed", active);

        if (active) {
          // Agregar con rango global como default
          this._selected.set(dia, {
            inicio: this._gInicio.value || "09:00",
            fin:    this._gFin.value    || "17:00"
          });
        } else {
          this._selected.delete(dia);
        }

        this._renderRows();
      });
    });
  }

  // ── Aplicar rango global ─────────────────────────────────────────────────────

  _aplicarGlobal() {
    const inicio = this._gInicio.value;
    const fin    = this._gFin.value;

    if (!inicio || !fin) return;

    this._selected.forEach((_, dia) => {
      this._selected.set(dia, { inicio, fin });
    });

    this._renderRows();
  }

  // ── Render filas de días seleccionados ───────────────────────────────────────

  _renderRows() {
    this._rows.innerHTML = "";

    if (this._selected.size === 0) return;

    // Ordenar por valor de día
    const ordenados = [...this._selected.entries()]
      .sort(([a], [b]) => {
        // domingo al final
        const order = [1, 2, 3, 4, 5, 6, 0];
        return order.indexOf(a) - order.indexOf(b);
      });

    ordenados.forEach(([dia, rango]) => {
      const info = DIAS.find(d => d.value === dia);
      const row  = document.createElement("div");
      row.classList.add("hs-day-row");
      row.dataset.dia = dia;

      row.innerHTML = `
        <span class="hs-day-name">${info.full}</span>
        <div class="hs-day-inputs">
          <input type="time" class="hs-inicio" value="${rango.inicio}" />
          <span class="hs-sep">→</span>
          <input type="time" class="hs-fin"    value="${rango.fin}"    />
        </div>
        <span class="hs-row-error"></span>
      `;

      // Sincronizar cambios en los inputs con el estado interno
      const inputInicio = row.querySelector(".hs-inicio");
      const inputFin    = row.querySelector(".hs-fin");

      const sync = () => {
        this._selected.set(dia, {
          inicio: inputInicio.value,
          fin:    inputFin.value
        });
        this._limpiarErrorFila(row);
      };

      inputInicio.addEventListener("change", sync);
      inputFin.addEventListener("change",    sync);

      this._rows.appendChild(row);
    });
  }

  // ── API pública ──────────────────────────────────────────────────────────────

  /**
   * Valida y retorna los horarios listos para la API, o null si hay errores.
   */
  recopilarYValidar() {
    if (this._selected.size === 0) return [];

    let valido = true;
    const horarios = [];

    this._rows.querySelectorAll(".hs-day-row").forEach(row => {
      const dia    = Number(row.dataset.dia);
      const inicio = row.querySelector(".hs-inicio").value;
      const fin    = row.querySelector(".hs-fin").value;

      if (!inicio) {
        this._mostrarErrorFila(row, "Falta hora de inicio.");
        valido = false; return;
      }
      if (!fin) {
        this._mostrarErrorFila(row, "Falta hora de fin.");
        valido = false; return;
      }
      if (fin <= inicio) {
        this._mostrarErrorFila(row, "El fin debe ser posterior al inicio.");
        valido = false; return;
      }

      this._limpiarErrorFila(row);
      horarios.push({ dia_semana: dia, hora_inicio: inicio + ":00", hora_fin: fin + ":00" });
    });

    if (!valido) {
      this._error.textContent = "Corregí los errores en los horarios.";
      this._error.style.display = "flex";
      return null;
    }

    this._error.style.display = "none";
    return horarios;
  }

  limpiar() {
    this._selected.clear();
    this._chips.forEach(c => {
      c.classList.remove("hs-chip--active");
      c.setAttribute("aria-pressed", "false");
    });
    this._rows.innerHTML = "";
    this._error.style.display = "none";
  }

  /**
   * Carga horarios existentes (formato API: { dia_semana, hora_inicio, hora_fin }).
   */
  cargar(horarios = []) {
    this.limpiar();

    horarios.forEach(h => {
      const dia    = h.dia_semana;
      const inicio = (h.hora_inicio ?? "").slice(0, 5);
      const fin    = (h.hora_fin    ?? "").slice(0, 5);

      this._selected.set(dia, { inicio, fin });

      // Activar chip correspondiente
      const chip = this.container.querySelector(`.hs-chip[data-dia="${dia}"]`);
      if (chip) {
        chip.classList.add("hs-chip--active");
        chip.setAttribute("aria-pressed", "true");
      }
    });

    this._renderRows();
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  _mostrarErrorFila(row, msg) {
    const span = row.querySelector(".hs-row-error");
    if (span) span.textContent = msg;
    row.classList.add("hs-day-row--error");
  }

  _limpiarErrorFila(row) {
    const span = row.querySelector(".hs-row-error");
    if (span) span.textContent = "";
    row.classList.remove("hs-day-row--error");
  }
}