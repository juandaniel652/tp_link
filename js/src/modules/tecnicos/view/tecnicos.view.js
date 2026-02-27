export class TecnicosView {

  constructor() {
    this.form = document.getElementById("formGeneral");
    this.tableBody = document.getElementById("generalContainer");
    this.previewImagen = document.getElementById("previewImagen");
  }

  render(tecnicos) {
    this.tableBody.innerHTML = "";

    if (!tecnicos.length) {
      this.tableBody.innerHTML =
        `<tr><td colspan="7">No hay registros</td></tr>`;
      return;
    }

    tecnicos.forEach(t => {
      const tr = document.createElement("tr");

      const horariosTexto = (t.horarios || [])
        .map(h => `${h.dia_semana} ${h.hora_inicio?.slice(0,5)}-${h.hora_fin?.slice(0,5)}`)
        .join("<br>");

      tr.innerHTML = `
        <td>${t.imagenUrl ? `<img src="${t.imagenUrl}" class="foto-tecnico">` : "—"}</td>
        <td>${t.nombre}</td>
        <td>${t.apellido}</td>
        <td>${t.telefono || "-"}</td>
        <td>${t.duracionTurnoMinutos} min</td>
        <td>${horariosTexto || "-"}</td>
        <td>
          <button data-id="${t.id}" class="edit-btn">✏️</button>
          <button data-id="${t.id}" class="delete-btn">🗑️</button>
        </td>
      `;

      this.tableBody.appendChild(tr);
    });
  }

  getFormData() {
    return {
      nombre: this.form.querySelector("#nombre").value,
      apellido: this.form.querySelector("#apellido").value,
      telefono: this.form.querySelector("#telefono").value,
      duracionTurnoMinutos: this.form.querySelector("#duracionTurno").value,
      email: this.form.querySelector("#duracionEmail").value,
      imagen: this.form.querySelector("#imagen").files[0] ?? null
    };
  }

  resetForm() {
    this.form.reset();
    if (this.previewImagen) {
      this.previewImagen.src = "";
      this.previewImagen.style.display = "none";
    }
  }

  onSubmit(callback) {
    this.form.addEventListener("submit", e => {
      e.preventDefault();
      callback(this.getFormData());
    });
  }

  onEdit(callback) {
    this.tableBody.addEventListener("click", e => {
      const btn = e.target.closest(".edit-btn");
      if (!btn) return;
      callback(btn.dataset.id);
    });
  }

  onDelete(callback) {
    this.tableBody.addEventListener("click", e => {
      const btn = e.target.closest(".delete-btn");
      if (!btn) return;
      callback(btn.dataset.id);
    });
  }

  showError(message) {
    alert(message);
  }
}