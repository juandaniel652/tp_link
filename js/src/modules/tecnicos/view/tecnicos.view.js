// js/src/modules/tecnicos/view/tecnicos.view.js
import { BaseCrudView } from "../../../core/view/BaseCrudView.js";
import { HorariosView } from "../horarios/view/horarios.view.js";
import { obtenerTecnicos, crearTecnico, actualizarTecnico, eliminarTecnico } from "../service/tecnicos.service.js";

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

    this.btnAddHorario = this.form.querySelector("#addHorario");
    this.horariosContainer = this.form.querySelector("#listaHorarios");
    this.previewImagen = document.getElementById("previewImagen");

    this.imagenActual = null;
    this.indiceEdicion = null;

    this._bindEvents();
  }

  // =========================
  // EVENTS
  // =========================
  _bindEvents() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this._guardarTecnico();
    });

    this.form.querySelector("#btnCancel").addEventListener("click", () => {
      this.limpiarFormulario();
    });

    this.btnAddHorario.addEventListener("click", () => {
      this._agregarFilaHorario();
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

  // =========================
  // HORARIOS
  // =========================
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

    if (data.dia_semana !== undefined) row.querySelector(".dia").value = data.dia_semana;
    if (data.hora_inicio) row.querySelector(".inicio").value = data.hora_inicio.slice(0,5);
    if (data.hora_fin) row.querySelector(".fin").value = data.hora_fin.slice(0,5);

    row.querySelector(".remove").onclick = () => row.remove();
    this.horariosContainer.appendChild(row);
  }

  _recopilarHorarios() {
    return Array.from(this.horariosContainer.querySelectorAll(".horario-row"))
      .filter(r => r.querySelector(".inicio").value && r.querySelector(".fin").value)
      .map(r => ({
        dia_semana: Number(r.querySelector(".dia").value),
        hora_inicio: r.querySelector(".inicio").value + ":00",
        hora_fin: r.querySelector(".fin").value + ":00"
      }));
  }

  // =========================
  // TABLA
  // =========================
  async renderTabla() {
    this.contenedor.innerHTML = "";
    const tecnicos = await obtenerTecnicos();

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

    tecnicos.forEach(t => {
      const tr = document.createElement("tr");
      const horariosTexto = (r.horarios || [])
      .map(h => `${h.dia_semana ? diasSemana[h.dia_semana] : "?"} ${h.inicio}-${h.fin}`)
      .join("<br>");
        
    tr.innerHTML = `
      <td>${r.imagen_url ? `<img src="${r.imagen_url}" class="foto-tecnico">` : "—"}</td>
      <td>${r.nombre}</td>
      <td>${r.apellido}</td>
      <td>${r.telefono || "-"}</td>
      <td>${r.duracionTurnoMinutos ?? r.duracion_turno_min} min</td>
      <td>${horariosTexto || "-"}</td>
      <td>
        <button type="button" class="btn-edit">✏️</button>
        <button type="button" class="btn-delete">🗑️</button>
      </td>
    `;

      tr.querySelector(".btn-edit").onclick = () => this._editarTecnico(t);
      tr.querySelector(".btn-delete").onclick = () => this._eliminarTecnico(t.id);

      this.contenedor.appendChild(tr);
    });
  }

  // =========================
  // GUARDAR
  // =========================
  async _guardarTecnico() {
    const tecnico = this._recopilarDatosFormulario();

    const payload = {
      ...tecnico,
      duracionTurnoMinutos: Number(tecnico.duracionTurnoMinutos),
      horarios: tecnico.horarios,
      activo: true
    };

    if (this.indiceEdicion !== null) {
      await actualizarTecnico({ ...payload, id: this.indiceEdicion });
    } else {
      await crearTecnico(payload);
    }

    this.limpiarFormulario();
    await this.renderTabla();
  }

  _editarTecnico(t) {
    this.indiceEdicion = t.id;
    this.inputs.nombre.value = t.nombre;
    this.inputs.apellido.value = t.apellido;
    this.inputs.telefono.value = t.telefono || "";
    this.inputs.duracion.value = t.duracionTurnoMinutos;
    this.inputs.email.value = t.email || "";

    this.imagenActual = t.imagen || null;
    this.inputs.imagen.value = "";

    if (t.imagen) {
      this.previewImagen.src = t.imagen;
      this.previewImagen.style.display = "block";
    } else {
      this.previewImagen.style.display = "none";
    }

    this.horariosContainer.innerHTML = "";
    (t.horarios || []).forEach(h => this._agregarFilaHorario(h));

    this.form.querySelector("#btnSubmit").textContent = "Actualizar";
    this.form.querySelector("#btnCancel").style.display = "inline-block";
  }

  _recopilarDatosFormulario() {
    const nuevaImagen = this.inputs.imagen.files[0];
    return {
      nombre: this.inputs.nombre.value.trim(),
      apellido: this.inputs.apellido.value.trim(),
      telefono: this.inputs.telefono.value.trim(),
      duracionTurnoMinutos: this.inputs.duracion.value,
      email: this.inputs.email.value.trim(),
      imagen: nuevaImagen || this.imagenActual,
      horarios: this._recopilarHorarios()
    };
  }

  async _eliminarTecnico(id) {
    if (!confirm("¿Eliminar técnico?")) return;
    await eliminarTecnico(id);
    await this.renderTabla();
  }

  limpiarFormulario() {
    this.form.reset();
    this.horariosContainer.innerHTML = "";
    this.indiceEdicion = null;
    this.imagenActual = null;
    this.previewImagen.src = "";
    this.previewImagen.style.display = "none";
    this.form.querySelector("#btnSubmit").textContent = "Guardar";
    this.form.querySelector("#btnCancel").style.display = "none";
  }

}