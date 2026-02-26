import { describe, it, expect } from "vitest";
import { TurnosState } from "../state/turnos.state.js";

describe("TurnosState", () => {
  it("should set loading", () => {
    const state = new TurnosState();
    state.setLoading(true);
    expect(state.getState().loading).toBe(true);
  });

  it("should add turno", () => {
    const state = new TurnosState();
    state.addTurno({ id: 1 });
    expect(state.getState().turnos.length).toBe(1);
  });
});