import { describe, it, expect } from "vitest";
import {
  TurnoError,
  ConflictoHorarioError,
  ClienteSinDatosError,
  TecnicoNoEncontradoError,
  CamposFaltantesError,
  SinFechasDisponiblesError,
} from "../service/errors.js";

describe("errors de dominio de Turnos", () => {

  it("TurnoError extiende Error y tiene name correcto", () => {
    const e = new TurnoError("base");
    expect(e).toBeInstanceOf(Error);
    expect(e.name).toBe("TurnoError");
    expect(e.message).toBe("base");
  });

  it("ConflictoHorarioError tiene name y mensaje por defecto", () => {
    const e = new ConflictoHorarioError();
    expect(e).toBeInstanceOf(TurnoError);
    expect(e.name).toBe("ConflictoHorarioError");
    expect(e.message).toContain("Conflicto");
  });

  it("ConflictoHorarioError acepta mensaje personalizado", () => {
    const e = new ConflictoHorarioError("Horario ocupado: 09:00");
    expect(e.message).toBe("Horario ocupado: 09:00");
  });

  it("ClienteSinDatosError incluye el clienteId en el mensaje", () => {
    const e = new ClienteSinDatosError(42);
    expect(e).toBeInstanceOf(TurnoError);
    expect(e.name).toBe("ClienteSinDatosError");
    expect(e.message).toContain("42");
  });

  it("TecnicoNoEncontradoError incluye el tecnicoId en el mensaje", () => {
    const e = new TecnicoNoEncontradoError(7);
    expect(e.name).toBe("TecnicoNoEncontradoError");
    expect(e.message).toContain("7");
  });

  it("CamposFaltantesError lista los campos en el mensaje", () => {
    const e = new CamposFaltantesError(["cliente_id", "fecha"]);
    expect(e.name).toBe("CamposFaltantesError");
    expect(e.message).toContain("cliente_id");
    expect(e.message).toContain("fecha");
  });

  it("SinFechasDisponiblesError tiene el mensaje correcto", () => {
    const e = new SinFechasDisponiblesError();
    expect(e.name).toBe("SinFechasDisponiblesError");
    expect(e.message).toContain("30 días");
  });
});