export class BaseTableView {

  constructor(tableBodySelector) {
    this.tableBody = document.querySelector(tableBodySelector);
  }

  // =========================
  // EVENTOS BASE
  // =========================
  onEdit(callback) {
    this._onEdit = callback;
  }

  onDelete(callback) {
    this._onDelete = callback;
  }

  // =========================
  // RENDER GENERAL
  // =========================
  render(items) {
    this.tableBody.innerHTML = "";

    if (!items || !items.length) {
      this.tableBody.innerHTML = `
        <tr>
          <td colspan="100%">No hay registros</td>
        </tr>
      `;
      return;
    }

    items.forEach(item => {
      const tr = document.createElement("tr");

      // Delegado al hijo
      tr.innerHTML = `
        ${this.buildRowCells(item)}
        <td>
          <button type="button" class="btn-edit">✏️</button>
          <button type="button" class="btn-delete">🗑️</button>
        </td>
      `;

      tr.querySelector(".btn-edit").onclick = () => {
        this._onEdit?.(item.id);
      };

      tr.querySelector(".btn-delete").onclick = () => {
        this._onDelete?.(item.id);
      };

      this.tableBody.appendChild(tr);
    });
  }

  // Método abstracto
  buildRowCells() {
    throw new Error("Debes implementar buildRowCells en la clase hija");
  }

  showError(message) {
    console.error(message);
    
    if (!this.tableBody) return;
    
    this.tableBody.innerHTML = `
      <tr>
        <td colspan="100%" style="color:red">
          ${message}
        </td>
      </tr>
    `;
  }
}