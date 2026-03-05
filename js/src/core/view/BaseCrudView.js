import { BaseTableView } from "./BaseTableView.js";

export class BaseCrudView extends BaseTableView {

  constructor({ tableSelector, formSelector }) {
    super(tableSelector);

    this.form = document.querySelector(formSelector);
    if (!this.form) return;

    this.btnSubmit = this.form.querySelector("[type='submit']");
    this.btnCancel = this.form.querySelector("#btnCancel") || null;

    this._editingId = null;

    this._setupCancel();
  }

  // =========================
  // EVENTO SUBMIT BASE
  // =========================
  onSubmit(callback) {
    this.form.addEventListener("submit", e => {
      e.preventDefault();

      const data = this._getFormData();

      callback(data, this._editingId);
    });
  }

  // =========================
  // MODO EDICIÓN
  // =========================
  enterEditMode(id) {
    this._editingId = id;

    if (this.btnSubmit) {
      this.btnSubmit.textContent = "Actualizar";
    }

    if (this.btnCancel) {
      this.btnCancel.style.display = "inline-block";
    }
  }

  exitEditMode() {
    this._editingId = null;

    if (this.btnSubmit) {
      this.btnSubmit.textContent = "Guardar";
    }

    if (this.btnCancel) {
      this.btnCancel.style.display = "none";
    }

    this.resetForm();
  }

  _setupCancel() {
    if (!this.btnCancel) return;

    this.btnCancel.addEventListener("click", () => {
      this.exitEditMode();
    });
  }

  // =========================
  // ABSTRACTOS
  // =========================
  _getFormData() {
    throw new Error("Debes implementar _getFormData()");
  }

  fillForm() {
    throw new Error("Debes implementar fillForm()");
  }

  resetForm() {
    this.form.reset();
  }

   renderError(message) {

      const container = document.querySelector("#app");
    
      if (!container) {
        console.error(message);
        return;
      }
    
      container.innerHTML = `
        <div class="alert alert-danger">
          ${message}
        </div>
      `;
    }

}