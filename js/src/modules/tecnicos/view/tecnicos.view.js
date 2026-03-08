// modules/tecnicos/view/tecnicos.view.js
import HorariosView from "../horarios/view/horarios.view.js";

const DIAS_LABEL = {
  1: "Lunes", 2: "Martes", 3: "Miércoles",
  4: "Jueves", 5: "Viernes", 6: "Sábado", 7: "Domingo"
};

/**
 * Vista CRUD de técnicos.
 * El controlador se encarga de la lógica; la vista sólo maneja el DOM.
 *
 * Eventos emitidos a través de callbacks inyectados por el controlador:
 *   onGuardar(payload)   → crear / actualizar
 *   onEliminar(id)
 *   onCancelar()
 */
export default class TecnicosView {

  constructor(formSelector, tableBodySelector) {
    this.form       = document.querySelector(formSelector);
    this.contenedor = document.querySelector(tableBodySelector);

    if (!this.form || !this.contenedor)
      throw new Error("TecnicosView: no se encontró el formulario o el contenedor.");

    // Inputs del formulario
    this.inputs = {
      nombre:   this.form.querySelector("#nombre"),
      apellido: this.form.querySelector("#apellido"),
      telefono: this.form.querySelector("#telefono"),
      duracion: this.form.querySelector("#duracionTurno"),
      email:    this.form.querySelector("#duracionEmail"),
      imagen:   this.form.querySelector("#imagen")
    };

    this.previewImagen = document.getElementById("previewImagen");
    this.btnSubmit     = this.form.querySelector("#btnSubmit");
    this.btnCancel     = this.form.querySelector("#btnCancel");

    // Sub-módulo de horarios
    this.horariosView = new HorariosView(
      this.form.querySelector("#listaHorarios"),
      this.form.querySelector("#addHorario")
    );

    // Estado interno
    this._editandoId    = null;
    this._imagenActual  = null;   // URL de imagen existente al editar

    // Callbacks (se asignan desde el controlador)
    this.onGuardar  = null;
    this.onEliminar = null;
    this.onCancelar = null;

    this._bindEvents();
  }

  // ── Binding ─────────────────────────────────────────────────────────────────

  _bindEvents() {
    this.form.addEventListener("submit", e => {
      e.preventDefault();
      this._emitGuardar();
    });

    this.btnCancel.addEventListener("click", () => {
      this.onCancelar?.();
      this.resetFormulario();
    });

    this.inputs.imagen.addEventListener("change", () => {
      const file = this.inputs.imagen.files[0];
      if (file) {
        this.previewImagen.src = URL.createObjectURL(file);
        this.previewImagen.style.display = "block";
      } else {
        this.previewImagen.style.display = "none";
      }
    });
  }

  // ── Emit helpers ────────────────────────────────────────────────────────────

  _emitGuardar() {
    const nuevaImagen = this.inputs.imagen.files[0];

    const payload = {
      nombre:           this.inputs.nombre.value.trim(),
      apellido:         this.inputs.apellido.value.trim(),
      telefono:         this.inputs.telefono.value.trim(),
      duracion_turno_min: Number(this.inputs.duracion.value),
      email:            this.inputs.email.value.trim(),
      imagen:           nuevaImagen || this._imagenActual,
      horarios:         this.horariosView.recopilar(),
      activo:           true,
      ...(this._editandoId !== null && { id: this._editandoId })
    };

    this.onGuardar?.(payload);
  }

  // ── API pública (llamada desde el controlador) ───────────────────────────────

  /** Renderiza la lista de técnicos en la tabla. */
  renderTabla(tecnicos = []) {
    this.contenedor.innerHTML = "";

    if (!tecnicos.length) {
      this.contenedor.innerHTML = `<tr><td colspan="7">No hay registros.</td></tr>`;
      return;
    }

    tecnicos.forEach(r => {
      const tr = document.createElement("tr");

      const horariosTexto = (r.horarios || [])
        .map(h => `${DIAS_LABEL[h.dia_semana] ?? h.dia_semana} ${h.hora_inicio.slice(0, 5)}-${h.hora_fin.slice(0, 5)}`)
        .join("<br>");

      tr.innerHTML = `
        <td>${r.imagen ? `<img src="${r.imagen}" class="foto-tecnico" />` : "—"}</td>
        <td>${r.nombre}</td>
        <td>${r.apellido}</td>
        <td>${r.telefono || "-"}</td>
        <td>${r.duracionTurnoMinutos ?? r.duracion_turno_min} min</td>
        <td>${horariosTexto || "-"}</td>
        <td>
          <button type="button" class="btn-edit"   data-id="${r.id}">✏️</button>
          <button type="button" class="btn-delete" data-id="${r.id}">🗑️</button>
        </td>
      `;

      tr.querySelector(".btn-edit").onclick   = () => this._prepararEdicion(r);
      tr.querySelector(".btn-delete").onclick = () => this.onEliminar?.(r.id);

      this.contenedor.appendChild(tr);
    });
  }

  /** Rellena el formulario con los datos del técnico a editar. */
  _prepararEdicion(tecnico) {
    this._editandoId   = tecnico.id;
    this._imagenActual = tecnico.imagen ?? tecnico.imagen_url ?? null;

    this.inputs.nombre.value   = tecnico.nombre;
    this.inputs.apellido.value = tecnico.apellido;
    this.inputs.telefono.value = tecnico.telefono || "";
    this.inputs.duracion.value = tecnico.duracionTurnoMinutos ?? tecnico.duracion_turno_min;
    this.inputs.email.value    = tecnico.email || "";
    this.inputs.imagen.value   = "";

    if (this._imagenActual) {
      this.previewImagen.src          = this._imagenActual;
      this.previewImagen.style.display = "block";
    } else {
      this.previewImagen.style.display = "none";
    }

    this.horariosView.cargar(tecnico.horarios || []);

    this.btnSubmit.textContent      = "Actualizar";
    this.btnCancel.style.display    = "inline-block";
  }

  /** Limpia el formulario y vuelve al estado inicial. */
  resetFormulario() {
    this.form.reset();
    this.horariosView.limpiar();

    this._editandoId   = null;
    this._imagenActual = null;

    this.previewImagen.src          = "";
    this.previewImagen.style.display = "none";

    this.btnSubmit.textContent   = "Guardar";
    this.btnCancel.style.display = "none";
  }

  /** Muestra un error de validación junto al campo correspondiente. */
  mostrarError(campo, mensaje) {
    const el = this.form.querySelector(`[data-error="${campo}"]`);
    if (el) el.textContent = mensaje;
  }

  limpiarErrores() {
    this.form.querySelectorAll("[data-error]").forEach(el => (el.textContent = ""));
  }
}