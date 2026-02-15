// tecnico/UIHandler.js
import Tecnico from "./Tecnico.js";
import TecnicoService from "./TecnicoService.js";

export default class UIHandler {

  constructor(formSelector, tableBodySelector) {
    this.form = document.querySelector(formSelector);
    this.contenedor = document.querySelector(tableBodySelector);

    if (!this.form || !this.contenedor) {
      console.error("No se encontró el formulario o el contenedor");
      return;
    }

    // Inputs reales del HTML
    this.inputs = {
      nombre: this.form.querySelector("#nombre"),
      apellido: this.form.querySelector("#apellido"),
      telefono: this.form.querySelector("#telefono"),
      duracion: this.form.querySelector("#duracionTurno"),
      email: this.form.querySelector("#duracionEmail"),
      imagen: this.form.querySelector("#imagen")
    };

    // Contenedor horarios
    this.horariosContainer = this.form.querySelector("#diasHorarioGrid");
    this.btnAddHorario = this.form.querySelector("#addHorario");

    // Chequeo defensivo
    Object.entries(this.inputs).forEach(([k, v]) => {
      if (!v) console.error(`Input faltante en HTML: ${k}`);
    });
    if (!this.horariosContainer) console.error("Falta #diasHorarioGrid");
    if (!this.btnAddHorario) console.error("Falta #addHorario");

    this.indiceEdicion = null;
    this._bindEvents();
    this._inicializarHorariosUI();
  }

  // =========================
  // EVENTS
  // =========================
  _bindEvents() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this._guardarTecnico();
    });
  }

  _inicializarHorariosUI() {
    this.btnAddHorario.addEventListener("click", () => {
      this._agregarFilaHorario();
    });
  }

  // =========================
  // HORARIOS UI
  // =========================
  _agregarFilaHorario(data = {}) {
    const row = document.createElement("div");
    row.classList.add("horario-row");

    row.innerHTML = `
      <select class="dia">
        <option value="Lunes">Lunes</option>
        <option value="Martes">Martes</option>
        <option value="Miércoles">Miércoles</option>
        <option value="Jueves">Jueves</option>
        <option value="Viernes">Viernes</option>
        <option value="Sábado">Sábado</option>
      </select>

      <input type="time" class="inicio">
      <input type="time" class="fin">
      <button type="button" class="remove">🗑️</button>
    `;

    // Setear valores si viene de edición
    if (data.dia) row.querySelector(".dia").value = data.dia;
    if (data.inicio) row.querySelector(".inicio").value = data.inicio;
    if (data.fin) row.querySelector(".fin").value = data.fin;

    row.querySelector(".remove").onclick = () => row.remove();
    this.horariosContainer.appendChild(row);
  }

  _recopilarHorarios() {
    const rows = this.horariosContainer.querySelectorAll(".horario-row");

    return Array.from(rows).map(row => ({
      dia: row.querySelector(".dia").value,
      inicio: row.querySelector(".inicio").value,
      fin: row.querySelector(".fin").value
    }));
  }

  // =========================
  // RENDER TABLA
  // =========================
  async renderTabla() {
    this.contenedor.innerHTML = "";

    try {
      this.tecnicos = await TecnicoService.obtenerTodos();
    } catch (e) {
      console.error("Error cargando técnicos:", e.message);
      return;
    }

    if (!this.tecnicos || this.tecnicos.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="7" class="no-data">No hay registros</td>`;
      this.contenedor.appendChild(tr);
      return;
    }

    this.tecnicos.forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          ${r.imagen_url
            ? `<img src="${r.imagen_url}" class="foto-tecnico">`
            : "—"}
        </td>
        <td>${r.nombre}</td>
        <td>${r.apellido}</td>
        <td>${r.telefono || "-"}</td>
        <td>${r.duracion_turno_min} min</td>
        <td>${r.horarios?.length || 0}</td>
        <td>
          <button class="edit" style="color: green;">✏️</button>
          <button class="delete" style="color: red;">🗑️</button>
        </td>
      `;

      tr.querySelector(".edit")
        .addEventListener("click", () => this._editarTecnico(r));

      tr.querySelector(".delete")
        .addEventListener("click", () => this._eliminarTecnico(r.id));

      this.contenedor.appendChild(tr);
    });
  }

  // =========================
  // GUARDAR
  // =========================
  async _guardarTecnico() {
    try {
      const tecnico = await this._recopilarDatosFormulario();

      const payload = {
        nombre: tecnico.nombre,
        apellido: tecnico.apellido,
        telefono: tecnico.telefono,
        duracion_turno_min: Number(tecnico.duracionTurnoMinutos),
        email: tecnico.email,
        imagen_url: tecnico.imagen,
        horarios: tecnico.horarios
      };

      if (this.indiceEdicion) {
        await TecnicoService.actualizar(this.indiceEdicion, payload);
      } else {
        await TecnicoService.crear(payload);
      }

      this.limpiarFormulario();
      await this.renderTabla();

    } catch (e) {
      console.error("Error al guardar técnico:", e.message);
      alert(e.message);
    }
  }

  // =========================
  // EDITAR
  // =========================
  _editarTecnico(registro) {
    this.indiceEdicion = registro.id;
    this.inputs.nombre.value = registro.nombre;
    this.inputs.apellido.value = registro.apellido;
    this.inputs.telefono.value = registro.telefono || "";
    this.inputs.duracion.value = registro.duracion_turno_min;
    this.inputs.email.value = registro.email || "";
    this.inputs.imagen.value = "";

    // Cargar horarios
    this.horariosContainer.innerHTML = "";
    if (registro.horarios && registro.horarios.length > 0) {
      registro.horarios.forEach(h => this._agregarFilaHorario(h));
    }
  }

  // =========================
  // ELIMINAR
  // =========================
  async _eliminarTecnico(id) {
    if (!confirm("¿Eliminar técnico?")) return;
    await TecnicoService.eliminar(id);
    await this.renderTabla();
  }

  // =========================
  // HELPERS
  // =========================
  async _recopilarDatosFormulario() {
    return new Tecnico({
      nombre: this.inputs.nombre.value.trim(),
      apellido: this.inputs.apellido.value.trim(),
      telefono: this.inputs.telefono.value.trim(),
      duracionTurnoMinutos: this.inputs.duracion.value,
      email: this.inputs.email.value.trim(),
      imagen: this.inputs.imagen.value,
      horarios: this._recopilarHorarios()
    });
  }

  limpiarFormulario() {
    this.form.reset();
    this.horariosContainer.innerHTML = "";
    this.indiceEdicion = null;
  }
}
