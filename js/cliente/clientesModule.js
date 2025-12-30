// archivo: clientesModule.js
import { ClienteController } from './clienteController.js';

export class ClienteManager {
  constructor(formId, tablaId) {
    this.controller = new ClienteController(formId, tablaId);

    this.form = this.controller.form;
    this.tablaBody = this.controller.tablaBody;
    this.inputs = this.controller.inputs;

    // Mensajes dinámicos
    this.contadorTelefono = document.createElement('small');
    Object.assign(this.contadorTelefono.style, {
      display: 'block',
      marginTop: '4px',
      color: '#555'
    });
    this.inputs.telefono.insertAdjacentElement('afterend', this.contadorTelefono);

    this.mensajeValidacion = this.controller.mensajeValidacion;
    this.validador = this.controller.validador;
    this.tabla = this.controller.tabla;

    this.inicializarTelefono();
    this.agregarEventos();
    this.tabla.renderizar(this.controller.clientes);
  }

  inicializarTelefono() {
    this.inputs.telefono.value = "11";
    this.contadorTelefono.textContent = "0/8 dígitos";
    this.contadorTelefono.style.color = "orange";
  }

  agregarEventos() {
    // Campos que deben limpiarse en tiempo real
    this.inputs.numeroCliente.addEventListener('input', (e) => this.limpiarNumeros(e));
    this.inputs.nombre.addEventListener('input', (e) => this.limpiarLetras(e));
    this.inputs.apellido.addEventListener('input', (e) => this.limpiarLetras(e));
    this.inputs.domicilio.addEventListener('input', (e) => this.limpiarLetras(e));
    this.inputs.telefono.addEventListener('input', (e) => this.formatearTelefono(e));

    // ⚠️ NO tocar email ni número de domicilio para que el usuario escriba libremente
    this.form.addEventListener('submit', (e) => this.guardarCliente(e));
  }

  limpiarLetras(e) {
    e.target.value = e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
  }

  limpiarNumeros(e) {
    e.target.value = e.target.value.replace(/\D/g, '');
  }

  formatearTelefono(e) {
    let valor = e.target.value.replace(/\D/g, '');
    if (!valor.startsWith('11')) valor = '11' + valor;
    valor = valor.slice(0, 10);
    e.target.value = valor;

    const restantes = Math.max(0, valor.length - 2);
    this.contadorTelefono.textContent = `${restantes}/8 dígitos`;
    this.contadorTelefono.style.color = restantes < 8 ? "orange" : "green";
  }

  guardarCliente(e) {
    this.controller.guardarCliente(e);
    this.contadorTelefono.textContent = "0/8 dígitos";
    this.contadorTelefono.style.color = "orange";
  }

  editarCliente(index) {
    this.controller.editarCliente(index);
    this.inputs.telefono.dispatchEvent(new Event('input'));
  }

  eliminarCliente(index) {
    this.controller.eliminarCliente(index);
  }

  limpiarCamposFormulario() {
    this.controller.limpiarFormulario();
    this.contadorTelefono.textContent = "0/8 dígitos";
    this.contadorTelefono.style.color = "orange";
  }
}
