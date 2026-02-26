import { describe, it, expect, vi } from "vitest";
import * as api from "../service/turnos.api.js";
import { obtenerTurnosPorFecha } from "../service/turnos.service.js";

describe("TurnosService", () => {
  it("should return mapped turnos", async () => {
    vi.spyOn(api, "fetchTurnosPorFecha")
      .mockResolvedValue([{ id: 1 }]);

    const result = await obtenerTurnosPorFecha({
      fecha: "2025-01-01",
      token: "fake"
    });

    expect(result.length).toBe(1);
  });
});