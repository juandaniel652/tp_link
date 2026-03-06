// js/src/modules/tecnicos/view/tecnicos.view.js
import { BaseCrudView } from "../../../core/view/BaseCrudView.js";
import { TecnicoService } from "../service/tecnicos.service.js";
import { Tecnico } from "../model/tecnico.model.js";

export class TecnicosView extends BaseCrudView {

  constructor() {
    super({
      tableSelector: "#generalContainer",
      formSelector: "#formGeneral"
    });

    this.inputs = {
      nombre: document.querySelector("#nombre"),
      apellido: document.querySelector("#apellido"),
      telefono: document.querySelector("#telefono"),
      duracion: document.querySelector("#duracion"),
      email: document.querySelector("#email"),
      imagen: document.querySelector("#imagen")
    };

    this.previewImagen = document.querySelector("#previewImagen");
    this.horariosContainer = document.querySelector("#horariosContainer");
    this.btnSubmit = document.querySelector("#btnSubmit");
    this.btnCancel = document.querySelector("#btnCancel");

    this.indiceEdicion = null;
    this.imagenActual = null;

    this._configurarEventos();
  }

  _configurarEventos() {

    this.inputs.imagen.addEventListener("change", () => {
      const file = this.inputs.imagen.files[0];

      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          this.previewImagen.src = e.target.result;
          this.previewImagen.style.display = "block";
        };
        reader.readAsDataURL(file);
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

    const diaSemana = data.dia_semana ?? data.diaSemana;
    const horaInicio = data.inicio ?? data.hora_inicio;
    const horaFin = data.fin ?? data.hora_fin;

    if (diaSemana) row.querySelector(".dia").value = String(diaSemana);
    if (horaInicio) row.querySelector(".inicio").value = this._normalizarHora(horaInicio);
    if (horaFin) row.querySelector(".fin").value = this._normalizarHora(horaFin);

    row.querySelector(".remove").onclick = () => row.remove();
    this.horariosContainer.appendChild(row);
  }

  _recopilarHorarios() {
    const rows = this.horariosContainer.querySelectorAll(".horario-row");

    return Array.from(rows)
      .filter(row => row.querySelector(".inicio").value && row.querySelector(".fin").value)
      .map(row => ({
        dia_semana: Number(row.querySelector(".dia").value),
        inicio: this._normalizarHoraConSegundos(row.querySelector(".inicio").value),
        fin: this._normalizarHoraConSegundos(row.querySelector(".fin").value)
      }));
  }

  _normalizarHora(hora) {
    return String(hora).slice(0, 5);
  }

  _normalizarHoraConSegundos(hora) {
    if (!hora) return "";
    return hora.length === 5 ? `${hora}:00` : hora;
  }

  _obtenerDuracionTurno(tecnico) {
    const duracion = tecnico.duracionTurnoMinutos ?? tecnico.duracion_turno_min;
    return Number(duracion || 0);
  }

  _obtenerHorarios(tecnico) {
    return (tecnico.horarios || []).map(h => ({
      dia_semana: h.dia_semana ?? h.diaSemana,
      inicio: h.inicio ?? h.hora_inicio,
      fin: h.fin ?? h.hora_fin
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

      const horariosTexto = this._obtenerHorarios(r)
        .map(h => `${diasSemana[h.dia_semana]} ${h.inicio}-${h.fin}`)
        .join("<br>");

      const duracionTurnoMinutos = this._obtenerDuracionTurno(r);

      tr.innerHTML = `
        <td>${r.imagen_url ? `<img src="${r.imagen_url}" class="foto-tecnico">` : "—"}</td>
        <td>${r.nombre}</td>
        <td>${r.apellido}</td>
        <td>${r.telefono || "-"}</td>
        <td>${duracionTurnoMinutos} min</td>
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
      duracionTurnoMinutos: Math.max(1, Number(this.inputs.duracion.value)),
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
    this.inputs.duracion.value = this._obtenerDuracionTurno(tecnico);
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
    this._obtenerHorarios(tecnico).forEach(h => this._agregarFilaHorario(h));

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