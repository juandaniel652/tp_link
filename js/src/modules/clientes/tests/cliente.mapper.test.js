import { describe, it, expect } from "vitest";
import { mapClienteFromApi, mapClienteToApi } from "../mappers/cliente.mapper.js";
import { Cliente } from "../model/cliente.model.js";

describe("cliente.mapper", () => {
  const dto = {
    id: 5,
    numero_cliente: "C005",
    nombre: "Ana",
    apellido: "García",
    telefono: "9876543210",
    domicilio: "Calle Falsa",
    numero_domicilio: 123,
    email: "ana@mail.com"
  };

  describe("mapClienteFromApi", () => {
    it("mapea correctamente un DTO de la API a una instancia Cliente", () => {
      const cliente = mapClienteFromApi(dto);

      expect(cliente).toBeInstanceOf(Cliente);
      expect(cliente.id).toBe(5);
      expect(cliente.numeroCliente).toBe("C005");
      expect(cliente.nombre).toBe("Ana");
      expect(cliente.apellido).toBe("García");
      expect(cliente.telefono).toBe("9876543210");
      expect(cliente.domicilio).toBe("Calle Falsa");
      expect(cliente.numeroDomicilio).toBe(123);
      expect(cliente.email).toBe("ana@mail.com");
    });
  });

  describe("mapClienteToApi", () => {
    it("mapea correctamente un Cliente al formato esperado por la API", () => {
      const cliente = new Cliente({
        id: 5,
        numeroCliente: "C005",
        nombre: "Ana",
        apellido: "García",
        telefono: "9876543210",
        domicilio: "Calle Falsa",
        numeroDomicilio: "123",
        email: "ana@mail.com"
      });

      const payload = mapClienteToApi(cliente);

      expect(payload).toEqual({
        numero_cliente: "C005",
        nombre: "Ana",
        apellido: "García",
        telefono: "9876543210",
        domicilio: "Calle Falsa",
        numero_domicilio: 123,
        email: "ana@mail.com"
      });
    });

    it("convierte numeroDomicilio a número", () => {
      const cliente = new Cliente({
        numeroCliente: "C001",
        nombre: "Luis",
        apellido: "Torres",
        telefono: "111",
        domicilio: "Calle",
        numeroDomicilio: "456",
        email: "luis@mail.com"
      });

      const payload = mapClienteToApi(cliente);
      expect(typeof payload.numero_domicilio).toBe("number");
      expect(payload.numero_domicilio).toBe(456);
    });

    it("no incluye el campo id en el payload", () => {
      const cliente = new Cliente({
        id: 99,
        numeroCliente: "C001",
        nombre: "Luis",
        apellido: "Torres",
        telefono: "111",
        domicilio: "Calle",
        numeroDomicilio: 1,
        email: "luis@mail.com"
      });

      const payload = mapClienteToApi(cliente);
      expect(payload).not.toHaveProperty("id");
    });
  });
});