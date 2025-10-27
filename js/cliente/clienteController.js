// controllers/ClienteController.js
import { Cliente } from './cliente.js';
import { ValidadorClientes } from './validadorClientes.js';
import { ClienteTabla } from './clienteTabla.js';

export class ClienteController {
  constructor(formId, tablaId) {
    // === Elementos del DOM ===
    this.form = document.getElementById(formId);
    this.tablaBody = document.querySelector(`#${tablaId} tbody`);

    // Campos del formulario
    this.inputs = {
      numeroCliente: this.form.querySelector('#NumeroCliente'),
      nombre: this.form.querySelector('#clienteNombre'),
      apellido: this.form.querySelector('#clienteApellido'),
      telefono: this.form.querySelector('#clienteTelefono'),
      domicilio: this.form.querySelector('#clienteDomicilio'),
      numeroDomicilio: this.form.querySelector('#clienteNumeroDomicilio'),
      email: this.form.querySelector('#clienteEmail')
    };

    // === Estado ===
    this.clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    this.indiceEdicion = null;

    // === Mensajes dinámicos ===
    this.mensajeValidacion = document.createElement('small');
    this.mensajeValidacion.style.display = 'block';
    this.mensajeValidacion.style.marginTop = '8px';
    this.mensajeValidacion.style.color = 'red';
    this.form.appendChild(this.mensajeValidacion);

    // === Inicialización de validadores y tabla ===
    this.validador = new ValidadorClientes(this.mensajeValidacion);
    this.tabla = new ClienteTabla(this.tablaBody,
      (index) => this.editarCliente(index),
      (index) => this.eliminarCliente(index)
    );

    // === Configuración inicial ===
    this.configurarEventos();
    this.tabla.renderizar(this.clientes);
  }

  // ==============================
  // EVENTOS
  // ==============================
  configurarEventos() {
    this.form.addEventListener('submit', (e) => this.guardarCliente(e));

    // Solo los campos que requieren limpieza en tiempo real
    this.inputs.numeroCliente.addEventListener('input', (e) => this.limpiarNumeros(e));
    this.inputs.numeroDomicilio.addEventListener('input', (e) => this.limpiarNumeros(e)); // opcional
    this.inputs.nombre.addEventListener('input', (e) => this.limpiarLetras(e));
    this.inputs.apellido.addEventListener('input', (e) => this.limpiarLetras(e));
    this.inputs.domicilio.addEventListener('input', (e) => this.limpiarLetras(e));
    this.inputs.telefono.addEventListener('input', (e) => this.formatearTelefono(e));

    // ⚠️ No tocar email, se valida solo al guardar
  }

  // ==============================
  // VALIDACIONES
  // ==============================
  limpiarLetras(e) {
    e.target.value = e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
  }

  limpiarNumeros(e) {
    e.target.value = e.target.value.replace(/\D/g, '');
  }

  formatearTelefono(e) {
    let valor = e.target.value.replace(/\D/g, '');
    if (!valor.startsWith('11')) valor = '11' + valor;
    e.target.value = valor.slice(0, 10);
  }

  // ==============================
  // CRUD CLIENTES
  // ==============================
  guardarCliente(e) {
    e.preventDefault();

    const cliente = new Cliente(
      this.inputs.numeroCliente.value,
      this.inputs.nombre.value,
      this.inputs.apellido.value,
      this.inputs.telefono.value,
      this.inputs.domicilio.value,
      this.inputs.numeroDomicilio.value,
      this.inputs.email.value
    );

    // Validación
    if (!this.validador.validar(cliente)) return;

    if (this.indiceEdicion !== null) {
      this.clientes[this.indiceEdicion] = cliente;
      this.indiceEdicion = null;
    } else {
      this.clientes.push(cliente);
    }

    this.guardarEnLocalStorage();
    this.tabla.renderizar(this.clientes);
    this.limpiarFormulario();
  }

  editarCliente(index) {
    const cliente = this.clientes[index];
    this.inputs.numeroCliente.value = cliente.numeroCliente;
    this.inputs.nombre.value = cliente.nombre;
    this.inputs.apellido.value = cliente.apellido;
    this.inputs.telefono.value = cliente.telefono;
    this.inputs.domicilio.value = cliente.domicilio;
    this.inputs.numeroDomicilio.value = cliente.numeroDomicilio;
    this.inputs.email.value = cliente.email;
    this.form.querySelector("button[type='submit']").textContent = "Guardar Cambios";
    this.indiceEdicion = index;
  }

  eliminarCliente(index) {
    const cliente = this.clientes[index];
    if (confirm(`¿Seguro que quieres eliminar al cliente ${cliente.nombre} ${cliente.apellido}?`)) {
      this.clientes.splice(index, 1);
      this.guardarEnLocalStorage();
      this.tabla.renderizar(this.clientes);
    }
  }

  // ==============================
  // AUXILIARES
  // ==============================
  limpiarFormulario() {
    Object.values(this.inputs).forEach(input => input.value = '');
    this.form.querySelector("button[type='submit']").textContent = "Guardar Cliente";
    this.validador.limpiarMensaje();
  }

  guardarEnLocalStorage() {
    localStorage.setItem('clientes', JSON.stringify(this.clientes));
  }
}
