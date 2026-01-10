// controllers/ClienteController.js
import { Cliente } from './cliente.js';
import { ValidadorClientes } from './validadorClientes.js';
import { ClienteTabla } from './clienteTabla.js';
import { ClienteService } from "../service/clienteService.js";

export class ClienteController {
  constructor(formId, tablaId) {
    // === Elementos del DOM ===
    this.form = document.getElementById(formId);
    this.tablaBody = document.querySelector(`#${tablaId} tbody`);

    // === Servicios ===
    this.service = new ClienteService();

    // === Campos del formulario ===
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
    this.clientes = [];
    this.indiceEdicion = null;

    // === Mensajes dinámicos ===
    this.mensajeValidacion = document.createElement('small');
    this.mensajeValidacion.style.display = 'block';
    this.mensajeValidacion.style.marginTop = '8px';
    this.mensajeValidacion.style.color = 'red';
    this.form.appendChild(this.mensajeValidacion);

    // === Inicialización ===
    this.validador = new ValidadorClientes(this.mensajeValidacion);
    this.tabla = new ClienteTabla(
      this.tablaBody,
      (index) => this.editarCliente(index),
      (index) => this.eliminarCliente(index)
    );

    this.configurarEventos();
    this.cargarClientes();
  }

  // ==============================
  // EVENTOS
  // ==============================
  configurarEventos() {
    this.form.addEventListener('submit', (e) => this.guardarCliente(e));

    this.inputs.numeroCliente.addEventListener('input', e => this.limpiarNumeros(e));
    this.inputs.numeroDomicilio.addEventListener('input', e => this.limpiarNumeros(e));
    this.inputs.nombre.addEventListener('input', e => this.limpiarLetras(e));
    this.inputs.apellido.addEventListener('input', e => this.limpiarLetras(e));
    this.inputs.domicilio.addEventListener('input', e => this.limpiarLetras(e));
    this.inputs.telefono.addEventListener('input', e => this.formatearTelefono(e));
  }

  // ==============================
  // VALIDACIONES AUX
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
  // BACKEND
  // ==============================
  async cargarClientes() {
    try {
      this.clientes = await this.service.getAll();
      this.tabla.renderizar(this.clientes);
    } catch (error) {
      console.error(error);
      alert("No se pudieron cargar los clientes");
    }
  }

  async guardarCliente(e) {
    console.log("GUARDAR CLIENTE EJECUTADO");
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

    if (!this.validador.validar(cliente)) return;

    try {
      await this.service.create(cliente);
      await this.cargarClientes(); // fuente única de verdad
      this.limpiarFormulario();
    } catch (error) {
      alert(error.message);
    }
  }


  // ==============================
  // UI
  // ==============================
  editarCliente(index) {
    const cliente = this.clientes[index];
    this.inputs.numeroCliente.value = cliente.numeroCliente || '';
    this.inputs.nombre.value = cliente.nombre || '';
    this.inputs.apellido.value = cliente.apellido || '';
    this.inputs.telefono.value = cliente.telefono || '';
    this.inputs.domicilio.value = cliente.domicilio || '';
    this.inputs.numeroDomicilio.value = cliente.numeroDomicilio || '';
    this.inputs.email.value = cliente.email || '';
  }

  eliminarCliente(index) {
    alert("Eliminar aún no implementado en backend");
  }

  limpiarFormulario() {
    Object.values(this.inputs).forEach(input => input.value = '');
    this.validador.limpiarMensaje();
  }
}
