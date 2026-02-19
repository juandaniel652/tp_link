// tecnico/UIHandler.js
import TecnicoService from "./TecnicoService.js";

export default class UIHandler {

  constructor(formSelector, tableBodySelector) {
    this.form = document.querySelector(formSelector);
    this.contenedor = document.querySelector(tableBodySelector);

    if (!this.form || !this.contenedor) {
      throw new Error("No se encontró el formulario o el contenedor");
    }

    this._editarTecnico = this._editarTecnico.bind(this);
    this._guardarTecnico = this._guardarTecnico.bind(this);

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
        <option value="1">Lunes</option>
        <option value="2">Martes</option>
        <option value="3">Miércoles</option>
        <option value="4">Jueves</option>
        <option value="5">Viernes</option>
        <option value="6">Sábado</option>
      </select>

      <input type="time" class="inicio">
      <input type="time" class="fin">
      <button type="button" class="remove" style="color:red">🗑️</button>
    `;

    if (data.dia_semana !== undefined)
      row.querySelector(".dia").value = data.dia_semana;

    if (data.hora_inicio)
      row.querySelector(".inicio").value = data.hora_inicio.slice(0,5);

    if (data.hora_fin)
      row.querySelector(".fin").value = data.hora_fin.slice(0,5);

    row.querySelector(".remove").onclick = () => row.remove();
    this.horariosContainer.appendChild(row);
  }

  _recopilarHorarios() {
    const rows = this.horariosContainer.querySelectorAll(".horario-row");

    return Array.from(rows)
      .filter(row =>
        row.querySelector(".inicio").value &&
        row.querySelector(".fin").value
      )
      .map(row => ({
        dia_semana: Number(row.querySelector(".dia").value),
        hora_inicio: row.querySelector(".inicio").value + ":00",
        hora_fin: row.querySelector(".fin").value + ":00"
      }));
  }

  // =========================
  // RENDER TABLA
  // =========================
  async renderTabla() {
    this.contenedor.innerHTML = "";
    const tecnicos = await TecnicoService.obtenerTodos();

    if (!tecnicos.length) {
      this.contenedor.innerHTML = `<tr><td colspan="7">No hay registros</td></tr>`;
      return;
    }

    const diasSemana = 
    { 1: "Lunes", 
      2: "Martes", 
      3: "Miércoles", 
      4: "Jueves", 5: 
      "Viernes", 6: 
      "Sábado", 7: 
      "Domingo" 
    };

    tecnicos.forEach((r) => {
      const tr = document.createElement("tr");
    
      // transformar horarios a texto
      const horariosTexto = (r.horarios || [])
        .map(h => `${diasSemana[h.dia_semana]} ${h.hora_inicio.slice(0,5)}-${h.hora_fin.slice(0,5)}`)
        .join("<br>");
    
      tr.innerHTML = `
        <td>${r.imagen_url ? `<img src="${r.imagen_url}" class="foto-tecnico">` : "—"}</td>
        <td>${r.nombre}</td>
        <td>${r.apellido}</td>
        <td>${r.telefono || "-"}</td>
        <td>${r.duracion_turno_min} min</td>
        <td>${horariosTexto || "-"}</td>
        <td>
          <button type="button" class="btn-action.edit" style="color:green">✏️</button>
          <button type="button" class="btn-action.delete" style="color:red">🗑️</button>
        </td>
      `;
    
      tr.querySelector(".btn-action.edit").onclick = () => this._editarTecnico(r);
      tr.querySelector(".btn-action.delete").onclick = () => this._eliminarTecnico(r.id);
      this.contenedor.appendChild(tr);
    });

  }

  // =========================
  // GUARDAR
  // =========================
  async _guardarTecnico() {

    const tecnico = await this._recopilarDatosFormulario();

    const payload = {
      nombre: tecnico.nombre,
      apellido: tecnico.apellido,
      telefono: tecnico.telefono,
      duracion_turno_min: Number(tecnico.duracionTurnoMinutos),
      email: tecnico.email,
      imagen_url: tecnico.imagen,
      activo: true,                 
      horarios: tecnico.horarios
    };

    console.log("PAYLOAD FINAL REAL", payload);

    if (this.indiceEdicion !== null) {
      await TecnicoService.actualizar(this.indiceEdicion, payload);
    } else {
      delete payload.horarios;
      await TecnicoService.crear(payload);
    }

    this.limpiarFormulario();
    await this.renderTabla();
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

    // render directo desde backend
    this.horariosContainer.innerHTML = "";
    (registro.horarios || []).forEach(h => {
      this._agregarFilaHorario(h);
    });
  }

  // =========================
  // HELPERS
  // =========================
  _recopilarDatosFormulario() {
    return {
      nombre: this.inputs.nombre.value.trim(),
      apellido: this.inputs.apellido.value.trim(),
      telefono: this.inputs.telefono.value.trim(),
      duracionTurnoMinutos: this.inputs.duracion.value,
      email: this.inputs.email.value.trim(),
      imagen: this.inputs.imagen.value,
      horarios: this._recopilarHorarios()
    };
  }


  async _eliminarTecnico(id) {
    if (!confirm("¿Eliminar técnico?")) return;
    await TecnicoService.eliminar(id);
    await this.renderTabla();
  }

  limpiarFormulario() {
    this.form.reset();
    this.horariosContainer.innerHTML = "";
    this.indiceEdicion = null;
  }
}
