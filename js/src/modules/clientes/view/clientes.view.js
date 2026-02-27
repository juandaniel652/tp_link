export class ClientesView {

  constructor() {
    this.form = document.getElementById("formCliente");
    this.tableBody = document.querySelector("#clientesTable tbody");
  }

  render(clientes) {
    this.tableBody.innerHTML = "";

    clientes.forEach(cliente => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${cliente.numeroCliente}</td>
        <td>${cliente.nombre}</td>
        <td>${cliente.apellido}</td>
        <td>${cliente.telefono}</td>
        <td>${cliente.domicilio} ${cliente.numeroDomicilio}</td>
        <td>${cliente.email}</td>
        <td>
          <button data-id="${cliente.id}" class="edit-btn">✏️</button>
          <button data-id="${cliente.id}" class="delete-btn">🗑️</button>
        </td>
      `;

      this.tableBody.appendChild(tr);
    });
  }

  renderError(message) {
    alert(message);
  }

  fillForm(cliente) {
    document.getElementById("NumeroCliente").value = cliente.numeroCliente;
    document.getElementById("clienteNombre").value = cliente.nombre;
    document.getElementById("clienteApellido").value = cliente.apellido;
    document.getElementById("clienteTelefono").value = cliente.telefono;
    document.getElementById("clienteDomicilio").value = cliente.domicilio;
    document.getElementById("clienteNumeroDomicilio").value = cliente.numeroDomicilio;
    document.getElementById("clienteEmail").value = cliente.email;
  }

  resetForm() {
    this.form.reset();
  }

  onSubmit(callback) {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();

      callback({
        numeroCliente: document.getElementById("NumeroCliente").value,
        nombre: document.getElementById("clienteNombre").value,
        apellido: document.getElementById("clienteApellido").value,
        telefono: document.getElementById("clienteTelefono").value,
        domicilio: document.getElementById("clienteDomicilio").value,
        numeroDomicilio: document.getElementById("clienteNumeroDomicilio").value,
        email: document.getElementById("clienteEmail").value
      });
    });
  }

  onEditar(callback) {
    this.tableBody.addEventListener("click", (e) => {
      const btn = e.target.closest(".edit-btn");
      if (!btn) return;
      callback(btn.dataset.id);
    });
  }

  onEliminar(callback) {
    this.tableBody.addEventListener("click", (e) => {
      const btn = e.target.closest(".delete-btn");
      if (!btn) return;
      callback(btn.dataset.id);
    });
  }
}