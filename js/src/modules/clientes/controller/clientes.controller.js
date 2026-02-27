import {
  obtenerClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente
} from "../service/clientes.service.js";

import { Cliente } from "../model/cliente.model.js";

export class ClienteController {
  constructor({ view, tokenProvider }) {
    this.view = view;
    this.tokenProvider = tokenProvider;

    this.clientes = [];
    this.clienteEditando = null;
  }

  async init() {
    this.bindEvents();
    await this.cargarClientes();
  }

  bindEvents() {
    this.view.onSubmit((data) => this.handleGuardar(data));
    this.view.onEditar((id) => this.handleEditar(id));
    this.view.onEliminar((id) => this.handleEliminar(id));
  }

  async cargarClientes() {
    try {
      const token = this.tokenProvider.getToken();
      this.clientes = await obtenerClientes(token);
      this.view.render(this.clientes);
    } catch (error) {
      this.view.renderError(error.message);
    }
  }

  async handleGuardar(data) {
    try {
      const token = this.tokenProvider.getToken();

      const cliente = new Cliente({
        ...data,
        id: this.clienteEditando?.id ?? null
      });

      if (!this.clienteEditando) {
        await crearCliente(cliente, token);
      } else {
        await actualizarCliente(cliente, token);
        this.clienteEditando = null;
      }

      await this.cargarClientes();
      this.view.resetForm();

    } catch (error) {
      this.view.renderError(error.message);
    }
  }

  handleEditar(id) {
    const cliente = this.clientes.find(c => c.id === id);
    if (!cliente) return;

    this.clienteEditando = cliente;
    this.view.fillForm(cliente);
  }

  async handleEliminar(id) {
    const confirmar = confirm("¿Eliminar cliente?");
    if (!confirmar) return;

    try {
      const token = this.tokenProvider.getToken();
      await eliminarCliente(id, token);
      await this.cargarClientes();
    } catch (error) {
      this.view.renderError(error.message);
    }
  }
}