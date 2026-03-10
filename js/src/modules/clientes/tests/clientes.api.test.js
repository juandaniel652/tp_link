import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchClientes,
  createCliente,
  updateCliente,
  deleteCliente
} from "../service/clientes.api.js";

const TOKEN = "test-token";
const BASE_URL = "https://agenda-1-zomu.onrender.com/api/v1";

const clienteDto = {
  id: 1,
  numero_cliente: "C001",
  nombre: "Juan",
  apellido: "Pérez",
  telefono: "123",
  domicilio: "Calle",
  numero_domicilio: 1,
  email: "juan@mail.com"
};

function mockFetch(body, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => body
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("clientes.api", () => {
  describe("fetchClientes", () => {
    it("retorna los datos cuando la respuesta es ok", async () => {
      global.fetch = mockFetch([clienteDto]);
      const result = await fetchClientes(TOKEN);

      expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/clientes/`, expect.objectContaining({
        headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` })
      }));
      expect(result).toEqual([clienteDto]);
    });

    it("lanza error cuando la respuesta no es ok", async () => {
      global.fetch = mockFetch({ detail: "No autorizado" }, false, 401);

      await expect(fetchClientes(TOKEN)).rejects.toThrow("No autorizado");
    });
  });

  describe("createCliente", () => {
    it("hace POST y retorna el cliente creado", async () => {
      global.fetch = mockFetch(clienteDto);
      const payload = { numero_cliente: "C001", nombre: "Juan" };

      const result = await createCliente(payload, TOKEN);

      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/clientes/`,
        expect.objectContaining({ method: "POST", body: JSON.stringify(payload) })
      );
      expect(result).toEqual(clienteDto);
    });

    it("lanza error si la respuesta no es ok", async () => {
      global.fetch = mockFetch({ detail: "Error creando cliente" }, false);
      await expect(createCliente({}, TOKEN)).rejects.toThrow("Error creando cliente");
    });
  });

  describe("updateCliente", () => {
    it("hace PUT al endpoint correcto", async () => {
      global.fetch = mockFetch(clienteDto);
      const payload = { nombre: "Ana" };

      const result = await updateCliente(1, payload, TOKEN);

      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/clientes/1`,
        expect.objectContaining({ method: "PUT", body: JSON.stringify(payload) })
      );
      expect(result).toEqual(clienteDto);
    });

    it("lanza error si la respuesta no es ok", async () => {
      global.fetch = mockFetch({ detail: "Error actualizando cliente" }, false);
      await expect(updateCliente(1, {}, TOKEN)).rejects.toThrow("Error actualizando cliente");
    });
  });

  describe("deleteCliente", () => {
    it("hace DELETE y retorna true si es ok", async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true });

      const result = await deleteCliente(1, TOKEN);

      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/clientes/1`,
        expect.objectContaining({ method: "DELETE" })
      );
      expect(result).toBe(true);
    });

    it("lanza error si la respuesta no es ok", async () => {
      global.fetch = mockFetch({ detail: "Error eliminando cliente" }, false);
      await expect(deleteCliente(1, TOKEN)).rejects.toThrow("Error eliminando cliente");
    });
  });
});