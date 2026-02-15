// tecnico/UIHandler.js
import Tecnico from "./Tecnico.js";
import TecnicoService from "./TecnicoService.js";

export default class UIHandler {

  constructor(formSelector, tableBodySelector) {
    this.form = document.querySelector(formSelector);
    this.contenedor = document.querySelector(tableBodySelector);

    this.inputs = {
      nombre: this.form.querySelector("#nombre"),
      apellido: this.form.querySelector("#apellido"),
      telefono: this.form.querySelector("#telefono"),
      duracion: this.form.querySelector("#duracion"),
      email: this.form.querySelector("#email"),
      imagen: this.form.querySelector("#imagen")
    };

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
    this.tecnicos = await TecnicoService.obtenerTodos();

    if (this.tecnicos.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="7" class="no-data">No hay registros</td>`;
      this.contenedor.appendChild(tr);
      return;
    }

    this.tecnicos.forEach((r) => {
      const horariosStr = r.horarios
        ? r.horarios.map((h) => `${h.dia}: ${h.inicio} - ${h.fin}`).join("<br>")
        : "";

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
        <td>${horariosStr}</td>
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
  // GUARDAR (CREATE / UPDATE)
  // =========================
  async _guardarTecnico() {
    let valido = true;
    let errores = [];

    Object.entries(this.inputs).forEach(([key, input]) => {
      if (key !== "imagen" && !this._validarCampoIndividual(key, input.value)) {
        valido = false;
        errores.push(key);
      }
    });

    if (!valido) {
      this._mostrarErrorGlobal("Revisa los campos: " + errores.join(", "));
      return;
    }

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
      console.warn("Error al guardar técnico:", e.message);
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
    this.inputs.imagen.value = registro.imagen_url || "";
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
      nombre: this.inputs.nombre.value,
      apellido: this.inputs.apellido.value,
      telefono: this.inputs.telefono.value,
      duracionTurnoMinutos: this.inputs.duracion.value,
      email: this.inputs.email.value,
      imagen: this.inputs.imagen.value,
      horarios: [] // después lo enchufamos
    });
  }

  _validarCampoIndividual(campo, valor) {
    const error = Tecnico.validarCampo(campo, valor);
    if (error) {
      this._mostrarErrorCampo(campo, error);
      return false;
    }
    this._limpiarErrorCampo(campo);
    return true;
  }

  limpiarFormulario() {
    this.form.reset();
    this.indiceEdicion = null;
  }

  _mostrarErrorCampo(campo, mensaje) {
    console.warn(`Error en ${campo}: ${mensaje}`);
  }

  _limpiarErrorCampo(campo) {}

  _mostrarErrorGlobal(mensaje) {
    alert(mensaje);
  }
}
