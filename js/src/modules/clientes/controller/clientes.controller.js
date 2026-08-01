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
    
    // --- NUEVA LÓGICA DE ROL ---
    const token = this.tokenProvider.getToken();
    const payload = JSON.parse(atob(token.split(".")[1]));
    const role = payload.role ?? 'user';

    if (role !== "admin") {
      this.aplicarModoLectura();
    }
    // ---------------------------

    await this.cargarClientes();
  }

  aplicarModoLectura() {
    const formSection = document.querySelector("#formCliente");
    if (formSection) {
      // Usamos las propiedades de tu CSS para deshabilitar
      const box = formSection.closest(".box");
      box.style.opacity = "0.75";
      
      // Bloqueamos todos los inputs y botones del form
      const elements = formSection.querySelectorAll("input, button");
      elements.forEach(el => el.disabled = true);
      
      // Ocultamos las acciones del formulario
      const actions = formSection.querySelector(".form-actions");
      if (actions) actions.style.display = "none";
      
      // Cambiamos el título para dar feedback
      const h2 = box.querySelector("h2");
      if (h2) h2.textContent = "Consulta de Clientes";
    }
  }

  bindEvents() {
    this.view.onSubmit((data) => this.handleGuardar(data));
    this.view.onEdit((id) => this.handleEditar(id));
    this.view.onDelete((id) => this.handleEliminar(id));
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