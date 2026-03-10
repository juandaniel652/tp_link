import { describe, it, expect } from "vitest";
import { Cliente } from "../model/cliente.model.js";

describe("Cliente model", () => {
  const baseData = {
    id: 1,
    numeroCliente: "  C001  ",
    nombre: "  Juan  ",
    apellido: "  Pérez  ",
    telefono: "  1234567890  ",
    domicilio: "  Av. Siempreviva  ",
    numeroDomicilio: 742,
    email: "  juan@mail.com  "
  };

  it("crea una instancia con los datos correctos", () => {
    const cliente = new Cliente(baseData);

    expect(cliente.id).toBe(1);
    expect(cliente.numeroCliente).toBe("C001");
    expect(cliente.nombre).toBe("Juan");
    expect(cliente.apellido).toBe("Pérez");
    expect(cliente.telefono).toBe("1234567890");
    expect(cliente.domicilio).toBe("Av. Siempreviva");
    expect(cliente.numeroDomicilio).toBe(742);
    expect(cliente.email).toBe("juan@mail.com");
  });

  it("hace trim en todos los campos string", () => {
    const cliente = new Cliente(baseData);

    expect(cliente.nombre).toBe("Juan");
    expect(cliente.apellido).toBe("Pérez");
    expect(cliente.email).toBe("juan@mail.com");
  });

  it("id es null por defecto si no se pasa", () => {
    const { id, ...sinId } = baseData;
    const cliente = new Cliente(sinId);

    expect(cliente.id).toBeNull();
  });
});