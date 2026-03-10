import { describe, it, expect } from "vitest";
import Tecnico from "../model/tecnico.model.js";

const baseData = {
  id: 1,
  nombre: "  Carlos  ",
  apellido: "  López  ",
  telefono: "  11 1234-5678  ",
  email: "  carlos@mail.com  ",
  duracion_turno_min: 30,
  horarios: [
    { dia_semana: 1, hora_inicio: "09:00:00", hora_fin: "17:00:00" }
  ]
};

describe("Tecnico model", () => {

  describe("constructor", () => {
    it("crea una instancia con los datos correctos y hace trim", () => {
      const t = new Tecnico(baseData);

      expect(t.id).toBe(1);
      expect(t.nombre).toBe("Carlos");
      expect(t.apellido).toBe("López");
      expect(t.telefono).toBe("11 1234-5678");
      expect(t.email).toBe("carlos@mail.com");
    });

    it("acepta duracion_turno_minutos como alias", () => {
      const t = new Tecnico({ ...baseData, duracion_turno_minutos: 45, duracion_turno_min: undefined });
      expect(t.duracionTurnoMinutos).toBe(45);
    });

    it("acepta duracionTurnoMinutos como alias", () => {
      const t = new Tecnico({ ...baseData, duracionTurnoMinutos: 60, duracion_turno_min: undefined });
      expect(t.duracionTurnoMinutos).toBe(60);
    });

    it("activo es true por defecto si no se pasa", () => {
      const { activo, ...sinActivo } = baseData;
      const t = new Tecnico(sinActivo);
      expect(t.activo).toBe(true);
    });

    it("mapea horarios correctamente (dia_semana → nombre)", () => {
      const t = new Tecnico(baseData);
      expect(t.horarios).toHaveLength(1);
      expect(t.horarios[0].dia).toBe("lunes");
      expect(t.horarios[0].inicio).toBe("09:00");
      expect(t.horarios[0].fin).toBe("17:00");
    });

    it("horarios es array vacío si no se pasa", () => {
      const { horarios, ...sinHorarios } = baseData;
      const t = new Tecnico(sinHorarios);
      expect(t.horarios).toEqual([]);
    });
  });

  describe("getDiasDisponibles", () => {
    it("retorna los nombres de días de los horarios", () => {
      const t = new Tecnico({
        ...baseData,
        horarios: [
          { dia_semana: 1, hora_inicio: "09:00", hora_fin: "17:00" },
          { dia_semana: 3, hora_inicio: "10:00", hora_fin: "14:00" }
        ]
      });
      expect(t.getDiasDisponibles()).toEqual(["lunes", "miercoles"]);
    });
  });

  describe("generarBloques", () => {
    it("genera bloques correctamente según duración", () => {
      const t = new Tecnico({
        ...baseData,
        duracion_turno_min: 60,
        horarios: [{ dia_semana: 1, hora_inicio: "09:00", hora_fin: "11:00" }]
      });
      const bloques = t.generarBloques();
      expect(bloques["lunes"]).toEqual(["09:00", "10:00"]);
    });

    it("genera bloques de 30 min correctamente", () => {
      const t = new Tecnico({
        ...baseData,
        duracion_turno_min: 30,
        horarios: [{ dia_semana: 5, hora_inicio: "08:00", hora_fin: "09:30" }]
      });
      const bloques = t.generarBloques();
      expect(bloques["viernes"]).toEqual(["08:00", "08:30", "09:00"]);
    });
  });

  describe("validarCampo", () => {
    it("nombre válido retorna string vacío", () => {
      expect(Tecnico.validarCampo("nombre", "Carlos")).toBe("");
    });

    it("nombre con números retorna error", () => {
      expect(Tecnico.validarCampo("nombre", "Carlos123")).not.toBe("");
    });

    it("apellido vacío retorna error", () => {
      expect(Tecnico.validarCampo("apellido", "")).not.toBe("");
    });

    it("teléfono corto retorna error", () => {
      expect(Tecnico.validarCampo("telefono", "123")).not.toBe("");
    });

    it("teléfono con 8+ caracteres es válido", () => {
      expect(Tecnico.validarCampo("telefono", "11223344")).toBe("");
    });

    it("email inválido retorna error", () => {
      expect(Tecnico.validarCampo("email", "no-es-email")).not.toBe("");
    });

    it("email válido retorna string vacío", () => {
      expect(Tecnico.validarCampo("email", "a@b.com")).toBe("");
    });

    it("duración 0 retorna error", () => {
      expect(Tecnico.validarCampo("duracionTurnoMinutos", 0)).not.toBe("");
    });

    it("duración mayor a 90 retorna error", () => {
      expect(Tecnico.validarCampo("duracionTurnoMinutos", 95)).not.toBe("");
    });

    it("duración no múltiplo de 5 retorna error", () => {
      expect(Tecnico.validarCampo("duracionTurnoMinutos", 17)).not.toBe("");
    });

    it("duración válida (30) retorna string vacío", () => {
      expect(Tecnico.validarCampo("duracionTurnoMinutos", 30)).toBe("");
    });
  });

  describe("validar", () => {
    it("retorna true con datos válidos", () => {
      const t = {
        nombre: "Carlos",
        apellido: "López",
        telefono: "11223344",
        email: "c@mail.com",
        duracionTurnoMinutos: 30
      };
      expect(Tecnico.validar(t)).toBe(true);
    });

    it("retorna false si algún campo es inválido", () => {
      const t = {
        nombre: "",
        apellido: "López",
        telefono: "11223344",
        email: "c@mail.com",
        duracionTurnoMinutos: 30
      };
      expect(Tecnico.validar(t)).toBe(false);
    });
  });
});