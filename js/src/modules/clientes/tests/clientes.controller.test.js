import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClienteController } from "../controller/clientes.controller.js";
import * as service from "../service/clientes.service.js";
import { Cliente } from "../model/cliente.model.js";

vi.mock("../service/clientes.service.js");

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeCliente(overrides = {}) {
  return new Cliente({
    id: 1,
    numeroCliente: "C001",
    nombre: "Juan",
    apellido: "Pérez",
    telefono: "123",
    domicilio: "Calle",
    numeroDomicilio: 10,
    email: "juan@mail.com",
    ...overrides
  });
}

function makeView() {
  return {
    onSubmit: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    render: vi.fn(),
    renderError: vi.fn(),
    resetForm: vi.fn(),
    fillForm: vi.fn(),
    enterEditMode: vi.fn()
  };
}

function makeController(viewOverrides = {}) {
  const view = { ...makeView(), ...viewOverrides };
  const tokenProvider = { getToken: vi.fn().mockReturnValue("test-token") };
  const controller = new ClienteController({ view, tokenProvider });
  return { controller, view, tokenProvider };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.confirm = vi.fn().mockReturnValue(true);
});

describe("ClienteController", () => {
  describe("init", () => {
    it("enlaza eventos y carga clientes al inicializar", async () => {
      const { controller, view } = makeController();
      service.obtenerClientes.mockResolvedValue([makeCliente()]);

      await controller.init();

      expect(view.onSubmit).toHaveBeenCalled();
      expect(view.onEdit).toHaveBeenCalled();
      expect(view.onDelete).toHaveBeenCalled();
      expect(view.render).toHaveBeenCalledWith([expect.objectContaining({ nombre: "Juan" })]);
    });

    it("llama a renderError si obtenerClientes falla", async () => {
      const { controller, view } = makeController();
      service.obtenerClientes.mockRejectedValue(new Error("Sin conexión"));

      await controller.init();

      expect(view.renderError).toHaveBeenCalledWith("Sin conexión");
    });
  });

  describe("handleGuardar - crear", () => {
    it("crea un cliente nuevo cuando no hay clienteEditando", async () => {
      const { controller, view } = makeController();
      service.obtenerClientes.mockResolvedValue([]);
      service.crearCliente.mockResolvedValue(makeCliente());

      await controller.handleGuardar({
        numeroCliente: "C002",
        nombre: "Ana",
        apellido: "García",
        telefono: "999",
        domicilio: "Av",
        numeroDomicilio: 5,
        email: "ana@mail.com"
      });

      expect(service.crearCliente).toHaveBeenCalled();
      expect(service.actualizarCliente).not.toHaveBeenCalled();
      expect(view.resetForm).toHaveBeenCalled();
    });
  });

  describe("handleGuardar - editar", () => {
    it("actualiza el cliente si hay clienteEditando y limpia el estado", async () => {
      const { controller, view } = makeController();
      service.obtenerClientes.mockResolvedValue([makeCliente()]);
      service.actualizarCliente.mockResolvedValue(makeCliente());

      controller.clienteEditando = makeCliente();

      await controller.handleGuardar({
        numeroCliente: "C001",
        nombre: "Juan",
        apellido: "Pérez",
        telefono: "123",
        domicilio: "Calle",
        numeroDomicilio: 10,
        email: "juan@mail.com"
      });

      expect(service.actualizarCliente).toHaveBeenCalled();
      expect(service.crearCliente).not.toHaveBeenCalled();
      expect(controller.clienteEditando).toBeNull();
      expect(view.resetForm).toHaveBeenCalled();
    });
  });

  describe("handleEditar", () => {
    it("asigna clienteEditando y llama fillForm con el cliente correcto", async () => {
      const { controller, view } = makeController();
      const cliente = makeCliente();
      controller.clientes = [cliente];

      controller.handleEditar(1);

      expect(controller.clienteEditando).toBe(cliente);
      expect(view.fillForm).toHaveBeenCalledWith(cliente);
    });

    it("no hace nada si el id no existe", () => {
      const { controller, view } = makeController();
      controller.clientes = [];

      controller.handleEditar(99);

      expect(view.fillForm).not.toHaveBeenCalled();
    });
  });

  describe("handleEliminar", () => {
    it("elimina el cliente y recarga la lista si el usuario confirma", async () => {
      const { controller, view } = makeController();
      service.eliminarCliente.mockResolvedValue(true);
      service.obtenerClientes.mockResolvedValue([]);

      await controller.handleEliminar(1);

      expect(service.eliminarCliente).toHaveBeenCalledWith(1, "test-token");
      expect(view.render).toHaveBeenCalled();
    });

    it("no elimina si el usuario cancela el confirm", async () => {
      globalThis.confirm = vi.fn().mockReturnValue(false);
      const { controller } = makeController();

      await controller.handleEliminar(1);

      expect(service.eliminarCliente).not.toHaveBeenCalled();
    });

    it("llama a renderError si eliminarCliente falla", async () => {
      const { controller, view } = makeController();
      service.eliminarCliente.mockRejectedValue(new Error("No se pudo eliminar"));

      await controller.handleEliminar(1);

      expect(view.renderError).toHaveBeenCalledWith("No se pudo eliminar");
    });
  });
});