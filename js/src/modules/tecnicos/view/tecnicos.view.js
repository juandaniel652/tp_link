// js/src/modules/tecnicos/view/tecnicos.view.js
import { BaseCrudView } from "../../../core/view/BaseCrudView.js";
import { HorariosView } from "../horarios/view/horarios.view.js";

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

    // Submódulo de horarios
    this.horariosView = new HorariosView(
      "#listaHorarios",
      "#addHorario"
    );
  }

  buildRowCells(t) {
    const diasSemana = [
      "Domingo","Lunes","Martes","Miércoles",
      "Jueves","Viernes","Sábado"
    ];

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

  _getFormData() {
    const duracion = Number(this.inputs.duracionTurno.value);
    if (!duracion || duracion <= 0) {
      throw new Error("La duración del turno debe ser mayor a 0");
    }
  
    return {
      nombre: this.inputs.nombre.value.trim(),
      apellido: this.inputs.apellido.value.trim(),
      email: this.inputs.email.value.trim(),
      telefono: this.inputs.telefono.value.trim(),
      duracionTurnoMinutos: duracion, // coincide con mapper
      imagenFile: this.inputs.imagen.files[0] || null, // coincide con API
      horarios: this.horariosView.getHorarios()
    };
  }

  fillForm(tecnico) {
    this.inputs.nombre.value = tecnico.nombre;
    this.inputs.apellido.value = tecnico.apellido;
    this.inputs.email.value = tecnico.email || "";
    this.inputs.telefono.value = tecnico.telefono || "";
    this.inputs.duracionTurno.value = tecnico.duracionTurnoMin || "";

    this.inputs.previewImagen.src = tecnico.imagenUrl || "";
    this.inputs.previewImagen.style.display =
      tecnico.imagenUrl ? "block" : "none";

    // Cargar horarios en submódulo
    const horariosValidos = (tecnico.horarios || []).map(h => ({
      diaSemana: h.diaSemana ?? 0,
      horaInicio: h.horaInicio ?? "09:00",
      horaFin: h.horaFin ?? "17:00"
    }));
    this.horariosView.setHorarios(horariosValidos);

    this.enterEditMode(tecnico.id);
  }

  resetForm() {
    super.resetForm();

    this.inputs.previewImagen.src = "";
    this.inputs.previewImagen.style.display = "none";

    this.horariosView.reset();
  }
}