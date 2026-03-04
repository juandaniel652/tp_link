import { BaseCrudView } from "../../../core/view/BaseCrudView.js";

export class ClientesView extends BaseCrudView {

  constructor() {
    super({
      tableSelector: "#clientesTable tbody",
      formSelector: "#formCliente"
    });
  }

  buildRowCells(cliente) {
    return `
      <td>${cliente.numeroCliente}</td>
      <td>${cliente.nombre}</td>
      <td>${cliente.apellido}</td>
      <td>${cliente.telefono}</td>
      <td>${cliente.domicilio} ${cliente.numeroDomicilio}</td>
      <td>${cliente.email}</td>
    `;
  }

  _getFormData() {
    return {
      numeroCliente: document.getElementById("NumeroCliente").value,
      nombre: document.getElementById("clienteNombre").value,
      apellido: document.getElementById("clienteApellido").value,
      telefono: document.getElementById("clienteTelefono").value,
      domicilio: document.getElementById("clienteDomicilio").value,
      numeroDomicilio: document.getElementById("clienteNumeroDomicilio").value,
      email: document.getElementById("clienteEmail").value
    };
  }

  fillForm(cliente) {
    document.getElementById("NumeroCliente").value = cliente.numeroCliente;
    document.getElementById("clienteNombre").value = cliente.nombre;
    document.getElementById("clienteApellido").value = cliente.apellido;
    document.getElementById("clienteTelefono").value = cliente.telefono;
    document.getElementById("clienteDomicilio").value = cliente.domicilio;
    document.getElementById("clienteNumeroDomicilio").value = cliente.numeroDomicilio;
    document.getElementById("clienteEmail").value = cliente.email;

    this.enterEditMode(cliente.id);
  }
}