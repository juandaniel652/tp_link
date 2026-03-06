// js/src/modules/tecnicos/view/tecnicos.view.js
import { BaseCrudView } from "../../../core/view/BaseCrudView.js";

// export class TecnicosView
export class TecnicosView extends BaseCrudView {

  constructor() {
    super({
      tableSelector: "#generalContainer",
      formSelector: "#formGeneral"
    });

    this.inputs = {
      nombre: this.form.querySelector("#nombre"),
      apellido: this.form.querySelector("#apellido"),
      email: this.form.querySelector("#duracionEmail"),
      telefono: this.form.querySelector("#telefono"),
      duracionTurno: this.form.querySelector("#duracionTurno"),
      imagen: this.form.querySelector("#imagen"),
      previewImagen: this.form.querySelector("#previewImagen")
    };

    // reemplazar disponibilidadView por un método interno de manejo de horarios
    // Ejemplo: inicializamos un arreglo para los horarios
    this.horarios = [];
  }

  recopilarHorarios() {
    // lógica para obtener los horarios desde inputs del form
    return this.horarios;
  }

  renderHorarios(horarios) {
    this.horarios = horarios;
    // aquí podrías renderizar en #listaHorarios si existe
    const container = this.form.querySelector("#listaHorarios");
    if (!container) return;

    container.innerHTML = horarios.map(h => 
      `${["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"][h.diaSemana]} ${h.horaInicio}-${h.horaFin}`
    ).join("<br>");
  }

  buildRowCells(t) {
    const diasSemana = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
    const horariosTexto = (t.horarios || [])
    .map(h => {
      const inicio = h.horaInicio ? h.horaInicio.slice(0,5) : "--:--";
      const fin = h.horaFin ? h.horaFin.slice(0,5) : "--:--";
      return `${diasSemana[h.diaSemana] || "?"} ${inicio}-${fin}`;
    })
    .join("<br>");

    return `
      <td>${t.imagenUrl ? `<img src="${t.imagenUrl}" class="foto-tecnico">` : "—"}</td>
      <td>${t.nombre}</td>
      <td>${t.apellido}</td>
      <td>${t.telefono || "-"}</td>
      <td>${t.duracionTurnoMin} min</td>
      <td>${horariosTexto || "-"}</td>
    `;
  }

  _getFormData() {
    return {
      nombre: this.inputs.nombre.value.trim(),
      apellido: this.inputs.apellido.value.trim(),
      email: this.inputs.email.value.trim(),
      telefono: this.inputs.telefono.value.trim(),
      duracionTurnoMin: Number(this.inputs.duracionTurno.value),
      imagen: this.inputs.imagen.files[0] || null,
      horarios: this.recopilarHorarios()
    };
  }

  fillForm(tecnico) {
    this.inputs.nombre.value = tecnico.nombre;
    this.inputs.apellido.value = tecnico.apellido;
    this.inputs.email.value = tecnico.email || "";
    this.inputs.telefono.value = tecnico.telefono || "";
    this.inputs.duracionTurno.value = tecnico.duracionTurnoMin;
    this.inputs.previewImagen.src = tecnico.imagenUrl || "";
    this.inputs.previewImagen.style.display = tecnico.imagenUrl ? "block" : "none";
    this.renderHorarios(tecnico.horarios || []);
    this.enterEditMode(tecnico.id);
  }

  resetForm() {
    super.resetForm();
    this.horarios = [];
    this.inputs.previewImagen.src = "";
    this.inputs.previewImagen.style.display = "none";
  }
}