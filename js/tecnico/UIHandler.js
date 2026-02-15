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

    // IDs reales del HTML
    this.inputs = {
      nombre: this.form.querySelector("#nombre"),
      apellido: this.form.querySelector("#apellido"),
      telefono: this.form.querySelector("#telefono"),
      duracion: this.form.querySelector("#duracionTurno"),
      email: this.form.querySelector("#duracionEmail"),
      imagen: this.form.querySelector("#imagen")
    };

    // chequeo defensivo (modo profesional)
    Object.entries(this.inputs).forEach(([k, v]) => {
      if (!v) console.error(`Input faltante en HTML: ${k}`);
    });

    this.indiceEdicion = null;
    this._bindEvents();
  }

  _bindEvents() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this._guardarTecnico();
    });
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
        <td>-</td>
        <td>
          <button class="edit">✏️</button>
          <button class="delete">🗑️</button>
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
        imagen_url: tecnico.imagen
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
    this.inputs.imagen.value = ""; // no se puede setear file por seguridad
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
      imagen: this.inputs.imagen.value, // luego se hace upload real
      horarios: []
    });
  }

  limpiarFormulario() {
    this.form.reset();
    this.indiceEdicion = null;
  }
}
