import { describe, it, expect, vi, beforeEach } from "vitest";
import TecnicosController from "../controller/tecnicos.controller.js";
import TecnicosService from "../service/tecnicos.service.js";
import Tecnico from "../model/tecnico.model.js";

vi.mock("../service/tecnicos.service.js");

// ─── Mock de TecnicosView como clase ────────────────────────────────────────
// vi.mock necesita retornar una clase real (constructor function).
// Guardamos la última instancia creada en `currentView` para inspeccionarla.

let currentView;

vi.mock("../view/tecnicos.view.js", () => ({
  default: class MockTecnicosView {
    constructor() {
      this.onGuardar      = null;
      this.onEliminar     = null;
      this.onCancelar     = null;
      this.renderTabla    = vi.fn();
      this.resetFormulario = vi.fn();
      this.mostrarError   = vi.fn();
      this.limpiarErrores = vi.fn();
      // Guardamos referencia a esta instancia para poder usarla en los tests
      currentView = this;
    }
  }
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeTecnico(overrides = {}) {
  return new Tecnico({
    id: 1,
    nombre: "Carlos",
    apellido: "López",
    telefono: "11223344",
    email: "c@mail.com",
    duracion_turno_min: 30,
    horarios: [],
    ...overrides
  });
}

function makeController() {
  const controller = new TecnicosController("#formGeneral", "#generalContainer");
  return { controller, view: currentView };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.confirm = vi.fn().mockReturnValue(true);
  globalThis.alert   = vi.fn();
});

describe("TecnicosController", () => {

  describe("init", () => {
    it("carga la tabla al inicializar", async () => {
      const { controller, view } = makeController();
      TecnicosService.obtenerTodos.mockResolvedValue([makeTecnico()]);

      await controller.init();

      expect(TecnicosService.obtenerTodos).toHaveBeenCalledOnce();
      expect(view.renderTabla).toHaveBeenCalledWith([
        expect.objectContaining({ nombre: "Carlos" })
      ]);
    });

    it("no lanza error si obtenerTodos falla (maneja internamente)", async () => {
      const { controller } = makeController();
      TecnicosService.obtenerTodos.mockRejectedValue(new Error("Sin red"));

      await expect(controller.init()).resolves.not.toThrow();
    });
  });

  describe("_guardar - crear", () => {
    it("crea un tecnico nuevo si el payload no tiene id", async () => {
      const { controller, view } = makeController();
      TecnicosService.crear.mockResolvedValue({});
      TecnicosService.obtenerTodos.mockResolvedValue([]);

      await controller._guardar({
        nombre: "Carlos",
        apellido: "López",
        telefono: "11223344",
        email: "c@mail.com",
        duracion_turno_min: 30,
        horarios: []
      });

      expect(TecnicosService.crear).toHaveBeenCalledOnce();
      expect(TecnicosService.actualizar).not.toHaveBeenCalled();
      expect(view.resetFormulario).toHaveBeenCalled();
    });
  });

  describe("_guardar - actualizar", () => {
    it("actualiza si el payload tiene id", async () => {
      const { controller, view } = makeController();
      TecnicosService.actualizar.mockResolvedValue({});
      TecnicosService.obtenerTodos.mockResolvedValue([]);

      await controller._guardar({
        id: 1,
        nombre: "Carlos",
        apellido: "López",
        telefono: "11223344",
        email: "c@mail.com",
        duracion_turno_min: 30,
        horarios: []
      });

      expect(TecnicosService.actualizar).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ nombre: "Carlos" })
      );
      expect(TecnicosService.crear).not.toHaveBeenCalled();
      expect(view.resetFormulario).toHaveBeenCalled();
    });
  });

  describe("_guardar - validación", () => {
    it("no llama al service si el payload es inválido", async () => {
      const { controller, view } = makeController();

      await controller._guardar({
        nombre: "",           // inválido
        apellido: "López",
        telefono: "11223344",
        email: "c@mail.com",
        duracion_turno_min: 30,
        horarios: []
      });

      expect(TecnicosService.crear).not.toHaveBeenCalled();
      expect(TecnicosService.actualizar).not.toHaveBeenCalled();
      expect(view.mostrarError).toHaveBeenCalled();
    });
  });

  describe("_eliminar", () => {
    it("elimina el tecnico y recarga la tabla si el usuario confirma", async () => {
      const { controller, view } = makeController();
      TecnicosService.eliminar.mockResolvedValue(true);
      TecnicosService.obtenerTodos.mockResolvedValue([]);

      await controller._eliminar(1);

      expect(TecnicosService.eliminar).toHaveBeenCalledWith(1);
      expect(view.renderTabla).toHaveBeenCalled();
    });

    it("no elimina si el usuario cancela el confirm", async () => {
      globalThis.confirm = vi.fn().mockReturnValue(false);
      const { controller } = makeController();

      await controller._eliminar(1);

      expect(TecnicosService.eliminar).not.toHaveBeenCalled();
    });

    it("no lanza error si eliminar falla (maneja internamente)", async () => {
      const { controller } = makeController();
      TecnicosService.eliminar.mockRejectedValue(new Error("Error al eliminar"));

      await expect(controller._eliminar(1)).resolves.not.toThrow();
    });
  });

  describe("_validar", () => {
    it("retorna true con datos válidos", () => {
      const { controller, view } = makeController();

      const resultado = controller._validar({
        nombre: "Carlos",
        apellido: "López",
        telefono: "11223344",
        email: "c@mail.com",
        duracion_turno_min: 30
      });

      expect(resultado).toBe(true);
      expect(view.mostrarError).not.toHaveBeenCalled();
    });

    it("retorna false y llama a mostrarError con campos inválidos", () => {
      const { controller, view } = makeController();

      const resultado = controller._validar({
        nombre: "123",      // inválido
        apellido: "",       // inválido
        telefono: "11223344",
        email: "no-email",  // inválido
        duracion_turno_min: 7  // no múltiplo de 5
      });

      expect(resultado).toBe(false);
      expect(view.mostrarError).toHaveBeenCalled();
    });
  });
});