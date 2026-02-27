export class TurnosView {

  // =========================
  // URL
  // =========================

  getSearchString() {
    return window.location.search;
  }

  applyParamsToSelects({ clienteId, ticketId }) {
    const selectCliente = document.getElementById("selectCliente");
    const selectTicket = document.getElementById("selectTicket");

    if (selectCliente && clienteId) {
      this.selectOrCreateOption(selectCliente, clienteId);
    }

    if (selectTicket && ticketId) {
      this.selectOrCreateOption(
        selectTicket,
        ticketId,
        `Ticket ${ticketId}`
      );
    }
  }

  selectOrCreateOption(selectElement, value, label = value) {
    const existingOption = Array.from(selectElement.options)
      .find(opt => opt.value == value);

    if (existingOption) {
      selectElement.value = value;
      return;
    }

    const newOption = document.createElement("option");
    newOption.value = value;
    newOption.textContent = label;
    newOption.selected = true;

    selectElement.appendChild(newOption);
  }

  // =========================
  // Render
  // =========================

  setLoading(isLoading) {
    const spinner = document.getElementById("spinner");
    if (!spinner) return;

    spinner.style.display = isLoading ? "block" : "none";
  }

  renderError(errorMessage) {
    const errorBox = document.getElementById("errorBox");
    if (!errorBox) return;

    errorBox.textContent = errorMessage ?? "";
  }

  renderTurnos(turnos) {
    const container = document.getElementById("turnosContainer");
    if (!container) return;

    container.innerHTML = "";

    if (!turnos || turnos.length === 0) {
      container.innerHTML = "<p>No hay turnos para esta fecha</p>";
      return;
    }

    turnos.forEach(turno => {
      const div = document.createElement("div");
      div.classList.add("turno-item");

      div.innerHTML = `
        <span>${turno.fecha} ${turno.hora}</span>
        <button data-id="${turno.id}" class="cancelar-btn">
          Cancelar
        </button>
      `;

      container.appendChild(div);
    });
  }

  renderDisponibilidad(disponibilidad) {
    const container = document.getElementById("disponibilidadContainer");
    if (!container) return;

    container.innerHTML = "";

    if (!disponibilidad || disponibilidad.length === 0) {
      container.innerHTML = "<p>No hay disponibilidad para esta fecha</p>";
      return;
    }

    disponibilidad.forEach(slot => {
      const btn = document.createElement("button");
      btn.textContent = slot.hora;
      btn.disabled = !slot.disponible;
      btn.classList.add("slot-btn");

      btn.addEventListener("click", () => {
        const horaInput = document.getElementById("horaInput");
        if (horaInput && slot.disponible) {
          horaInput.value = slot.hora;
        }
      });

      container.appendChild(btn);
    });
  }

  // =========================
  // Events
  // =========================

  onBuscarTurnos(callback) {
    const form = document.getElementById("buscarTurnosForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const fechaInput = document.getElementById("fechaInput");
      if (!fechaInput) return;

      callback(fechaInput.value);
    });
  }

  onCrearTurno(callback) {
    const form = document.getElementById("crearTurnoForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const fecha = document.getElementById("fechaInput")?.value;
      const hora = document.getElementById("horaInput")?.value;
      const clienteId = document.getElementById("selectCliente")?.value;
      const ticketId = document.getElementById("selectTicket")?.value;
      const tecnicoId = document.getElementById("selectTecnico")?.value;

      callback({
        fecha,
        hora,
        clienteId,
        ticketId,
        tecnicoId
      });
    });
  }

  onCancelarTurno(callback) {
    const container = document.getElementById("turnosContainer");
    if (!container) return;

    container.addEventListener("click", (e) => {
      const button = e.target.closest(".cancelar-btn");
      if (!button) return;

      const id = button.dataset.id;
      callback(id);
    });
  }

  onBuscarDisponibilidad(callback) {
    const btn = document.getElementById("btnDisponibilidad");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const tecnicoId = document.getElementById("selectTecnico")?.value;
      const fecha = document.getElementById("fechaInput")?.value;

      if (!tecnicoId || !fecha) return;

      callback({ tecnicoId, fecha });
    });
  }
}