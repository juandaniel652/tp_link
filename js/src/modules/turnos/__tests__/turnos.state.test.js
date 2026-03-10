import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  UI_STATE,
  cambiarEstado,
  getEstadoActual,
  onEstadoCambia,
  resetEstado,
} from "../state/turnos.state.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeRefs() {
  const make = () => ({
    innerHTML:       "",
    style:           { display: "" },
    textContent:     "",
  });

  return {
    turnosContainer:    make(),
    historialContainer: make(),
    selectorFecha:      make(),
    titulo:             make(),
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  resetEstado();
});

describe("turnos.state", () => {

  describe("UI_STATE", () => {
    it("tiene los valores DISPONIBILIDAD e HISTORIAL", () => {
      expect(UI_STATE.DISPONIBILIDAD).toBe("disponibilidad");
      expect(UI_STATE.HISTORIAL).toBe("historial");
    });

    it("está congelado (no se puede mutar)", () => {
      expect(() => { UI_STATE.NUEVO = "x"; }).toThrow();
    });
  });

  describe("getEstadoActual", () => {
    it("retorna null antes de cualquier cambio", () => {
      expect(getEstadoActual()).toBeNull();
    });

    it("retorna el estado actual tras cambiarEstado", () => {
      cambiarEstado(UI_STATE.HISTORIAL, makeRefs());
      expect(getEstadoActual()).toBe(UI_STATE.HISTORIAL);
    });
  });

  describe("cambiarEstado", () => {
    it("cambia al estado DISPONIBILIDAD y aplica estilos correctos", () => {
      const refs = makeRefs();
      cambiarEstado(UI_STATE.DISPONIBILIDAD, refs);

      expect(refs.turnosContainer.style.display).toBe("grid");
      expect(refs.historialContainer.style.display).toBe("none");
      expect(refs.selectorFecha.style.display).toBe("none");
      expect(refs.titulo.textContent).toBe("Turnos Disponibles");
    });

    it("cambia al estado HISTORIAL y aplica estilos correctos", () => {
      const refs = makeRefs();
      cambiarEstado(UI_STATE.HISTORIAL, refs);

      expect(refs.turnosContainer.style.display).toBe("none");
      expect(refs.historialContainer.style.display).toBe("block");
      expect(refs.selectorFecha.style.display).toBe("block");
      expect(refs.titulo.textContent).toBe("Historial de Turnos");
    });

    it("limpia ambos contenedores al cambiar estado", () => {
      const refs = makeRefs();
      refs.turnosContainer.innerHTML    = "<div>viejo</div>";
      refs.historialContainer.innerHTML = "<div>viejo</div>";

      cambiarEstado(UI_STATE.DISPONIBILIDAD, refs);

      expect(refs.turnosContainer.innerHTML).toBe("");
      expect(refs.historialContainer.innerHTML).toBe("");
    });

    it("no vuelve a cambiar si el estado es el mismo (no notifica doble)", () => {
      const refs = makeRefs();
      const listener = vi.fn();

      cambiarEstado(UI_STATE.DISPONIBILIDAD, refs);
      onEstadoCambia(UI_STATE.DISPONIBILIDAD, listener);

      // Intentar cambiar al mismo estado no debe notificar
      cambiarEstado(UI_STATE.DISPONIBILIDAD, refs);
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("onEstadoCambia", () => {
    it("notifica al suscriptor cuando cambia al estado escuchado", () => {
      const refs = makeRefs();
      const fn = vi.fn();

      onEstadoCambia(UI_STATE.HISTORIAL, fn);
      cambiarEstado(UI_STATE.HISTORIAL, refs);

      expect(fn).toHaveBeenCalledWith(UI_STATE.HISTORIAL);
    });

    it("no notifica si el estado cambiado es diferente al suscripto", () => {
      const refs = makeRefs();
      const fn = vi.fn();

      onEstadoCambia(UI_STATE.HISTORIAL, fn);
      cambiarEstado(UI_STATE.DISPONIBILIDAD, refs);

      expect(fn).not.toHaveBeenCalled();
    });

    it("suscriptor '*' recibe todos los cambios", () => {
      const refs = makeRefs();
      const fn = vi.fn();

      onEstadoCambia("*", fn);
      cambiarEstado(UI_STATE.DISPONIBILIDAD, refs);
      cambiarEstado(UI_STATE.HISTORIAL, refs);

      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("la función unsuscribe elimina el listener", () => {
      const refs = makeRefs();
      const fn = vi.fn();

      const unsub = onEstadoCambia(UI_STATE.HISTORIAL, fn);
      unsub();
      cambiarEstado(UI_STATE.HISTORIAL, refs);

      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe("resetEstado", () => {
    it("resetea el estado a null", () => {
      cambiarEstado(UI_STATE.DISPONIBILIDAD, makeRefs());
      resetEstado();
      expect(getEstadoActual()).toBeNull();
    });

    it("limpia todos los listeners", () => {
      const fn = vi.fn();
      onEstadoCambia(UI_STATE.DISPONIBILIDAD, fn);
      resetEstado();

      cambiarEstado(UI_STATE.DISPONIBILIDAD, makeRefs());
      expect(fn).not.toHaveBeenCalled();
    });
  });
});