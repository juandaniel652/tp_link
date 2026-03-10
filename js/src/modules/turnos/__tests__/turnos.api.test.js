import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getTurnos,
  getTurnosPorFecha,
  crearTurno,
  cancelarTurno,
  eliminarTurno,
} from "../service/turnos.api.js";

// Mock de tokenStorage para que no falle el import
vi.mock("@/core/storage/tokenStorage.js", () => ({
  tokenStorage: { getToken: () => "test-token" }
}));

const BASE = "https://agenda-1-zomu.onrender.com/api/v1/turnos";

const turnoRaw = {
  id: 1,
  fecha: "2025-06-02",
  hora_inicio: "09:00:00",
  hora_fin: "09:30:00",
  estado: "Abierto",
};

function mockFetch(body, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    json: async () => body,
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("turnos.api", () => {

  describe("getTurnos", () => {
    it("hace GET a /turnos y retorna los datos", async () => {
      global.fetch = mockFetch([turnoRaw]);

      const result = await getTurnos();

      expect(fetch).toHaveBeenCalledWith(BASE, expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer test-token" })
      }));
      expect(result).toEqual([turnoRaw]);
    });

    it("lanza error si la respuesta no es ok", async () => {
      global.fetch = mockFetch({ detail: "No autorizado" }, false);
      await expect(getTurnos()).rejects.toThrow("No autorizado");
    });
  });

  describe("getTurnosPorFecha", () => {
    it("hace GET con query param fecha", async () => {
      global.fetch = mockFetch([turnoRaw]);

      await getTurnosPorFecha("2025-06-02");

      expect(fetch).toHaveBeenCalledWith(
        `${BASE}?fecha=2025-06-02`,
        expect.anything()
      );
    });
  });

  describe("crearTurno", () => {
    it("hace POST con el payload correcto", async () => {
      global.fetch = mockFetch(turnoRaw);
      const payload = { cliente_id: 1, fecha: "2025-06-02" };

      const result = await crearTurno(payload);

      expect(fetch).toHaveBeenCalledWith(
        `${BASE}/`,
        expect.objectContaining({
          method: "POST",
          body:   JSON.stringify(payload),
        })
      );
      expect(result).toEqual(turnoRaw);
    });

    it("lanza error si la respuesta no es ok", async () => {
      global.fetch = mockFetch({ detail: "Error al crear" }, false);
      await expect(crearTurno({})).rejects.toThrow("Error al crear");
    });
  });

  describe("cancelarTurno", () => {
    it("hace PATCH a /turnos/:id/cancelar y retorna true", async () => {
      global.fetch = mockFetch({});

      const result = await cancelarTurno(5);

      expect(fetch).toHaveBeenCalledWith(
        `${BASE}/5/cancelar`,
        expect.objectContaining({ method: "PATCH" })
      );
      expect(result).toBe(true);
    });
  });

  describe("eliminarTurno", () => {
    it("hace DELETE a /turnos/:id y retorna true", async () => {
      global.fetch = mockFetch({});

      const result = await eliminarTurno(3);

      expect(fetch).toHaveBeenCalledWith(
        `${BASE}/3`,
        expect.objectContaining({ method: "DELETE" })
      );
      expect(result).toBe(true);
    });
  });
});