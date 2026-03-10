import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  obtenerClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente
} from "../service/clientes.service.js";
import * as api from "../service/clientes.api.js";
import { Cliente } from "../model/cliente.model.js";

vi.mock("../service/clientes.api.js");

const TOKEN = "test-token";

const dto = {
  id: 1,
  numero_cliente: "C001",
  nombre: "Juan",
  apellido: "Pérez",
  telefono: "123",
  domicilio: "Calle",
  numero_domicilio: 10,
  email: "juan@mail.com"
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("clientes.service", () => {
  describe("obtenerClientes", () => {
    it("retorna un array de instancias Cliente mapeadas desde la API", async () => {
      api.fetchClientes.mockResolvedValue([dto]);

      const result = await obtenerClientes(TOKEN);

      expect(api.fetchClientes).toHaveBeenCalledWith(TOKEN);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Cliente);
      expect(result[0].nombre).toBe("Juan");
    });
  });

  describe("crearCliente", () => {
    it("mapea, llama a la API y retorna el cliente creado", async () => {
      api.createCliente.mockResolvedValue(dto);

      const cliente = new Cliente({
        numeroCliente: "C001",
        nombre: "Juan",
        apellido: "Pérez",
        telefono: "123",
        domicilio: "Calle",
        numeroDomicilio: "10",
        email: "juan@mail.com"
      });

      const result = await crearCliente(cliente, TOKEN);

      expect(api.createCliente).toHaveBeenCalledWith(
        expect.objectContaining({ numero_cliente: "C001", nombre: "Juan" }),
        TOKEN
      );
      expect(result).toBeInstanceOf(Cliente);
    });
  });

  describe("actualizarCliente", () => {
    it("llama a updateCliente con el id y el payload correcto", async () => {
      api.updateCliente.mockResolvedValue(dto);

      const cliente = new Cliente({
        id: 1,
        numeroCliente: "C001",
        nombre: "Juan",
        apellido: "Pérez",
        telefono: "123",
        domicilio: "Calle",
        numeroDomicilio: "10",
        email: "juan@mail.com"
      });

      const result = await actualizarCliente(cliente, TOKEN);

      expect(api.updateCliente).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ nombre: "Juan" }),
        TOKEN
      );
      expect(result).toBeInstanceOf(Cliente);
    });
  });

  describe("eliminarCliente", () => {
    it("llama a deleteCliente con el id correcto", async () => {
      api.deleteCliente.mockResolvedValue(true);

      const result = await eliminarCliente(1, TOKEN);

      expect(api.deleteCliente).toHaveBeenCalledWith(1, TOKEN);
      expect(result).toBe(true);
    });
  });
});