// controllers/ClienteController.js
import { Cliente } from './cliente.js';
import { ValidadorClientes } from './validadorClientes.js';
import { ClienteTabla } from './clienteTabla.js';
import { ClienteService } from "../service/clienteService.js";

export class ClienteController {
  constructor(formId, tablaId) {
    this.form = document.getElementById(formId);
    this.tablaBody = document.querySelector(`#${tablaId} tbody`);

    this.inputs = {
      numeroCliente: this.form.querySelector('#NumeroCliente'),
      nombre: this.form.querySelector('#clienteNombre'),
      apellido: this.form.querySelector('#clienteApellido'),
      telefono: this.form.querySelector('#clienteTelefono'),
      domicilio: this.form.querySelector('#clienteDomicilio'),
      numeroDomicilio: this.form.querySelector('#clienteNumeroDomicilio'),
      email: this.form.querySelector('#clienteEmail')
    };

    this.clientes = [];
    this.indiceEdicion = null;

    this.mensajeValidacion = document.createElement('small');
    this.mensajeValidacion.style.display = 'block';
    this.mensajeValidacion.style.marginTop = '8px';
    this.mensajeValidacion.style.color = 'red';
    this.form.appendChild(this.mensajeValidacion);

    this.validador = new ValidadorClientes(this.mensajeValidacion);
    this.tabla = new ClienteTabla(
      this.tablaBody,
      (index) => this.editarCliente(index),
      (index) => this.eliminarCliente(index)
    );

    this.configurarEventos();
    this.cargarClientes();
  }

  configurarEventos() {
    this.form.addEventListener('submit', (e) => this.guardarCliente(e));

    this.inputs.numeroCliente.addEventListener('input', e => this.limpiarNumeros(e));
    this.inputs.numeroDomicilio.addEventListener('input', e => this.limpiarNumeros(e));
    this.inputs.nombre.addEventListener('input', e => this.limpiarLetras(e));
    this.inputs.apellido.addEventListener('input', e => this.limpiarLetras(e));
    this.inputs.domicilio.addEventListener('input', e => this.limpiarLetras(e));
    this.inputs.telefono.addEventListener('input', e => this.formatearTelefono(e));
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
    e.target.value = valor.slice(0, 10);
  }

  // ==============================
  // BACKEND
  // ==============================
  async cargarClientes() {
    try {
      this.clientes = await ClienteService.obtenerTodos();
      this.tabla.renderizar(this.clientes);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  async guardarCliente(e) {
    e.preventDefault();

    const cliente = {
      numero_cliente: this.inputs.numeroCliente.value,
      nombre: this.inputs.nombre.value,
      apellido: this.inputs.apellido.value,
      telefono: this.inputs.telefono.value,
      domicilio: this.inputs.domicilio.value,
      numero_domicilio: this.inputs.numeroDomicilio.value,
      email: this.inputs.email.value
    };

    if (!this.validador.validar(cliente)) return;

    try {
      if (this.indiceEdicion === null) {
        // CREAR
        await ClienteService.crear(cliente);
      } else {
        // EDITAR
        const clienteEditado = this.clientes[this.indiceEdicion];
        await ClienteService.actualizar(clienteEditado.id, cliente);
        this.indiceEdicion = null;
      }

      await this.cargarClientes();
      this.limpiarFormulario();

    } catch (error) {
      alert(error.message);
    }
  }


  editarCliente(index) {
    const cliente = this.clientes[index];

    this.inputs.numeroCliente.value = cliente.numero_cliente;
    this.inputs.nombre.value = cliente.nombre;
    this.inputs.apellido.value = cliente.apellido;
    this.inputs.telefono.value = cliente.telefono;
    this.inputs.domicilio.value = cliente.domicilio;
    this.inputs.numeroDomicilio.value = cliente.numero_domicilio;
    this.inputs.email.value = cliente.email;

    this.indiceEdicion = index;
    }


    async eliminarCliente(index) {
      const cliente = this.clientes[index];
      
      const confirmar = confirm(
        `¿Eliminar al cliente ${cliente.nombre} ${cliente.apellido}?`
      );
    
      if (!confirmar) return;
    
      try {
        await ClienteService.eliminar(cliente.id);
        await this.cargarClientes();
      } catch (error) {
        alert(error.message);
      }
    }


  limpiarFormulario() {
    Object.values(this.inputs).forEach(input => input.value = '');
    this.validador.limpiarMensaje();
  }
}
