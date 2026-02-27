// js/src/modules/tecnicos/view/tecnicos.view.js
import { DisponibilidadView } from "../../disponibilidad/view/disponibilidad.view.js";

export class TecnicosView {

  constructor() {
    this.form = document.querySelector("#formGeneral");
    this.tableBody = document.querySelector("#generalContainer");

    this.inputs = {
      nombre: this.form.querySelector("#nombre"),
      apellido: this.form.querySelector("#apellido"),
      email: this.form.querySelector("#duracionEmail"),
      telefono: this.form.querySelector("#telefono"),
      duracionTurno: this.form.querySelector("#duracionTurno"),
      imagen: this.form.querySelector("#imagen"),
      previewImagen: this.form.querySelector("#previewImagen")
    };

    this.btnSubmit = this.form.querySelector("#btnSubmit");
    this.btnCancel = this.form.querySelector("#btnCancel");

    // Disponibilidad UI
    this.disponibilidadView = new DisponibilidadView("#formGeneral", "#listaHorarios");
  }

  // =========================
  // EVENTOS
  // =========================
  onSubmit(callback) {
    this.form.addEventListener("submit", e => {
      e.preventDefault();
      const data = this._recopilarDatosFormulario();
      callback(data);
    });
  }

  onEdit(callback) {
    this._onEdit = callback;
  }

  onDelete(callback) {
    this._onDelete = callback;
  }

  // =========================
  // RENDER DE TABLA
  // =========================
  render(tecnicos) {
    this.tableBody.innerHTML = "";
    if (!tecnicos.length) {
      this.tableBody.innerHTML = `<tr><td colspan="7">No hay registros</td></tr>`;
      return;
    }

    const diasSemana = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];

    tecnicos.forEach(t => {
      const tr = document.createElement("tr");

      const horariosTexto = (t.horarios || [])
        .map(h => `${diasSemana[h.diaSemana]} ${h.horaInicio.slice(0,5)}-${h.horaFin.slice(0,5)}`)
        .join("<br>");

      tr.innerHTML = `
        <td>${t.imagenUrl ? `<img src="${t.imagenUrl}" class="foto-tecnico">` : "—"}</td>
        <td>${t.nombre}</td>
        <td>${t.apellido}</td>
        <td>${t.telefono || "-"}</td>
        <td>${t.duracionTurnoMin} min</td>
        <td>${horariosTexto || "-"}</td>
        <td>
          <button type="button" class="btn-edit">✏️</button>
          <button type="button" class="btn-delete">🗑️</button>
        </td>
      `;

      tr.querySelector(".btn-edit").onclick = () => this._onEdit?.(t.id);
      tr.querySelector(".btn-delete").onclick = () => this._onDelete?.(t.id);

      this.tableBody.appendChild(tr);
    });
  }

  // =========================
  // RESET FORM
  // =========================
  resetForm() {
    this.form.reset();
    this.disponibilidadView.reset();
    this.inputs.previewImagen.src = "";
    this.inputs.previewImagen.style.display = "none";
    this.btnCancel.style.display = "none";
    this.btnSubmit.textContent = "Guardar";
  }

  // =========================
  // FILL FORM (para editar)
  // =========================
  fillForm(tecnico) {
    this.inputs.nombre.value = tecnico.nombre;
    this.inputs.apellido.value = tecnico.apellido;
    this.inputs.email.value = tecnico.email || "";
    this.inputs.telefono.value = tecnico.telefono || "";
    this.inputs.duracionTurno.value = tecnico.duracionTurnoMin;

    // Imagen
    this.inputs.previewImagen.src = tecnico.imagenUrl || "";
    this.inputs.previewImagen.style.display = tecnico.imagenUrl ? "block" : "none";

    // Disponibilidad
    this.disponibilidadView.renderHorarios(tecnico.horarios || []);

    // Botones
    this.btnSubmit.textContent = "Actualizar";
    this.btnCancel.style.display = "inline-block";
  }

  // =========================
  // RECOPILAR DATOS FORM
  // =========================
  _recopilarDatosFormulario() {
    return {
      nombre: this.inputs.nombre.value.trim(),
      apellido: this.inputs.apellido.value.trim(),
      email: this.inputs.email.value.trim(),
      telefono: this.inputs.telefono.value.trim(),
      duracionTurnoMin: Number(this.inputs.duracionTurno.value),
      imagen: this.inputs.imagen.files[0] || null,
      horarios: this.disponibilidadView.recopilarHorarios()
    };
  }
}