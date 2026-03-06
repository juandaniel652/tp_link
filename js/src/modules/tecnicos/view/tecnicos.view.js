// js/src/modules/tecnicos/view/tecnicos.view.js
import { BaseCrudView } from "../../../core/view/BaseCrudView.js";
import * as TecnicoService from "../service/tecnicos.service.js";
import { Tecnico } from "../model/tecnico.model.js";

export class TecnicosView extends BaseCrudView {
  constructor() {
    super({
      tableSelector: "#generalContainer",
      formSelector: "#formGeneral"
    });

    this.inputs = {
      nombre: this.form.querySelector("#nombre"),
      apellido: this.form.querySelector("#apellido"),
      telefono: this.form.querySelector("#telefono"),
      duracion: this.form.querySelector("#duracionTurno"),
      email: this.form.querySelector("#duracionEmail"),
      imagen: this.form.querySelector("#imagen")
    };

    this.previewImagen = document.getElementById("previewImagen");
    this.imagenActual = null;

    this.btnSubmit = this.form.querySelector("#btnSubmit");
    this.btnCancel = this.form.querySelector("#btnCancel");

    this.btnAddHorario = this.form.querySelector("#addHorario");
    this.horariosContainer = this.form.querySelector("#listaHorarios");

    this.indiceEdicion = null;

    this._bindEvents();
  }

  _bindEvents() {
    this.form.addEventListener("submit", e => {
      e.preventDefault();
      this._guardarTecnico();
    });

    this.btnCancel.addEventListener("click", () => this.limpiarFormulario());
    this.btnAddHorario.addEventListener("click", () => this._agregarFilaHorario());

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

  _agregarFilaHorario(data = {}) {
    const row = document.createElement("div");
    row.classList.add("horario-row");

    row.innerHTML = `
      <select class="dia">
        <option value="1">Lunes</option>
        <option value="2">Martes</option>
        <option value="3">Miércoles</option>
        <option value="4">Jueves</option>
        <option value="5">Viernes</option>
        <option value="6">Sábado</option>
      </select>
      <input type="time" class="inicio">
      <input type="time" class="fin">
      <button type="button" class="remove">🗑️</button>
    `;

    if (data.dia_semana) row.querySelector(".dia").value = data.dia_semana;
    if (data.inicio) row.querySelector(".inicio").value = data.inicio.slice(0,5);
    if (data.fin) row.querySelector(".fin").value = data.fin.slice(0,5);

    row.querySelector(".remove").onclick = () => row.remove();
    this.horariosContainer.appendChild(row);
  }

  _recopilarHorarios() {
    const rows = this.horariosContainer.querySelectorAll(".horario-row");
    return Array.from(rows)
      .filter(row => row.querySelector(".inicio").value && row.querySelector(".fin").value)
      .map(row => ({
        dia_semana: Number(row.querySelector(".dia").value),
        inicio: row.querySelector(".inicio").value + ":00",
        fin: row.querySelector(".fin").value + ":00"
      }));
  }

  async renderTabla() {
    this.contenedor.innerHTML = "";
    const tecnicos = await TecnicoService.obtenerTodos();

    if (!tecnicos.length) {
      this.contenedor.innerHTML = `<tr><td colspan="7">No hay registros</td></tr>`;
      return;
    }

    const diasSemana = {
      1: "Lunes",
      2: "Martes",
      3: "Miércoles",
      4: "Jueves",
      5: "Viernes",
      6: "Sábado"
    };

    tecnicos.forEach(r => {
      const tr = document.createElement("tr");

      const horariosTexto = (r.horarios || [])
        .map(h => `${diasSemana[h.dia_semana]} ${h.inicio}-${h.fin}`)
        .join("<br>");

      tr.innerHTML = `
        <td>${r.imagen_url ? `<img src="${r.imagen_url}" class="foto-tecnico">` : "—"}</td>
        <td>${r.nombre}</td>
        <td>${r.apellido}</td>
        <td>${r.telefono || "-"}</td>
        <td>${r.duracionTurnoMinutos} min</td>
        <td>${horariosTexto || "-"}</td>
        <td>
          <button type="button" class="btn-edit">✏️</button>
          <button type="button" class="btn-delete">🗑️</button>
        </td>
      `;

      tr.querySelector(".btn-edit").onclick = () => this._editarTecnico(r);
      tr.querySelector(".btn-delete").onclick = () => this._eliminarTecnico(r.id);

      this.contenedor.appendChild(tr);
    });
  }

  _recopilarDatosFormulario() {
    const nuevaImagen = this.inputs.imagen.files[0];
    return new Tecnico({
      id: this.indiceEdicion,
      nombre: this.inputs.nombre.value.trim(),
      apellido: this.inputs.apellido.value.trim(),
      telefono: this.inputs.telefono.value.trim(),
      duracionTurnoMinutos: Number(this.inputs.duracion.value),
      email: this.inputs.email.value.trim(),
      imagen: nuevaImagen || this.imagenActual,
      imagenUrl: this.imagenActual,
      horarios: this._recopilarHorarios(),
      activo: true
    });
  }

  async _guardarTecnico() {
    const tecnico = this._recopilarDatosFormulario();

    if (this.indiceEdicion !== null) {
      await TecnicoService.actualizarTecnico(tecnico);
    } else {
      await TecnicoService.crearTecnico(tecnico);
    }

    this.limpiarFormulario();
    await this.renderTabla();
  }

  _editarTecnico(tecnico) {
    this.indiceEdicion = tecnico.id;

    this.inputs.nombre.value = tecnico.nombre;
    this.inputs.apellido.value = tecnico.apellido;
    this.inputs.telefono.value = tecnico.telefono || "";
    this.inputs.duracion.value = tecnico.duracionTurnoMinutos;
    this.inputs.email.value = tecnico.email || "";

    this.imagenActual = tecnico.imagenUrl || null;
    this.inputs.imagen.value = "";

    if (tecnico.imagenUrl) {
      this.previewImagen.src = tecnico.imagenUrl;
      this.previewImagen.style.display = "block";
    } else {
      this.previewImagen.style.display = "none";
    }

    this.horariosContainer.innerHTML = "";
    (tecnico.horarios || []).forEach(h => this._agregarFilaHorario(h));

    this.btnSubmit.textContent = "Actualizar";
    this.btnCancel.style.display = "inline-block";
  }

  async _eliminarTecnico(id) {
    if (!confirm("¿Eliminar técnico?")) return;
    await TecnicoService.eliminarTecnico(id);
    await this.renderTabla();
  }

  limpiarFormulario() {
    this.form.reset();
    this.horariosContainer.innerHTML = "";
    this.indiceEdicion = null;
    this.imagenActual = null;
    this.previewImagen.src = "";
    this.previewImagen.style.display = "none";
    this.btnSubmit.textContent = "Guardar";
    this.btnCancel.style.display = "none";
  }
}