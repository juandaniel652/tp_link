// js/src/modules/tecnicos/view/tecnicos.view.js
import { BaseCrudView } from "../../../core/view/BaseCrudView.js";

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

    // Inicializamos arreglo interno de horarios
    this.horarios = [];
  }

  // Recopila horarios desde inputs o estructura interna
  recopilarHorarios() {
    return this.horarios;
  }

  // Renderiza los horarios en el contenedor #listaHorarios
  renderHorarios(horarios) {
    this.horarios = horarios;
    const container = this.form.querySelector("#listaHorarios");
    if (!container) return;

    container.innerHTML = horarios.map(h => {
      const dia = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"][h.diaSemana] || "?";
      const inicio = h.horaInicio ? h.horaInicio.slice(0,5) : "--:--";
      const fin = h.horaFin ? h.horaFin.slice(0,5) : "--:--";
      return `${dia} ${inicio}-${fin}`;
    }).join("<br>");
  }

  // Construye las celdas de la tabla para cada técnico
  buildRowCells(t) {
    const diasSemana = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];

    const horariosTexto = (t.horarios || [])
      .map(h => {
        const dia = diasSemana[h.diaSemana] || "?";
        const inicio = h.horaInicio ? h.horaInicio.slice(0,5) : "--:--";
        const fin = h.horaFin ? h.horaFin.slice(0,5) : "--:--";
        return `${dia} ${inicio}-${fin}`;
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

  // Obtiene los datos del formulario
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

  // Llena el formulario con los datos de un técnico
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

  // Resetea el formulario y los horarios internos
  resetForm() {
    super.resetForm();
    this.horarios = [];
    this.inputs.previewImagen.src = "";
    this.inputs.previewImagen.style.display = "none";
  }
}