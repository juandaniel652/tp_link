import { describe, it, expect } from "vitest";
import {
  clienteYaTieneTurno,
  hayConflicto,
  filtrarClientesDisponibles,
  filtrarPorRango,
  obtenerHorariosDisponibles,
} from "../service/disponibilidad.service.js";

// ─── Fixtures ────────────────────────────────────────────────────────────────

/** ViewModel shape que usa hayConflicto */
function makeTurnoVM(overrides = {}) {
  return {
    fecha:           "2025-06-02",
    horaInicio:      "09:00",
    horaFin:         "09:30",
    clienteId:       1,
    tecnicoNombre:   "Carlos",
    tecnicoApellido: "López",
    ...overrides,
  };
}

/** Instancia mínima de Tecnico compatible con obtenerHorariosDisponibles */
function makeTecnico(overrides = {}) {
  return {
    nombre:   "Carlos",
    apellido: "López",
    duracionTurnoMinutos: 30,
    horarios: [
      { dia: "lunes", inicio: "09:00", fin: "11:00" }
    ],
    getDiasDisponibles() {
      return this.horarios.map(h => h.dia);
    },
    generarBloques() {
      const bloquesPorDia = {};
      this.horarios.forEach(({ dia, inicio, fin }) => {
        const bloques = [];
        let [h, m] = inicio.split(":").map(Number);
        const [hFin, mFin] = fin.split(":").map(Number);
        while (h < hFin || (h === hFin && m < mFin)) {
          bloques.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`);
          m += this.duracionTurnoMinutos;
          if (m >= 60) { h += Math.floor(m / 60); m %= 60; }
        }
        bloquesPorDia[dia] = bloques;
      });
      return bloquesPorDia;
    },
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("disponibilidad.service", () => {

  describe("clienteYaTieneTurno", () => {
    it("retorna true si el cliente tiene un turno (clienteId)", () => {
      const turnos = [makeTurnoVM({ clienteId: 5 })];
      expect(clienteYaTieneTurno(5, turnos)).toBe(true);
    });

    it("retorna true si el cliente viene en formato raw (cliente.id)", () => {
      const turnos = [{ cliente: { id: 5 } }];
      expect(clienteYaTieneTurno(5, turnos)).toBe(true);
    });

    it("retorna false si el cliente no tiene turno", () => {
      const turnos = [makeTurnoVM({ clienteId: 3 })];
      expect(clienteYaTieneTurno(99, turnos)).toBe(false);
    });

    it("compara como string (tolera id numérico vs string)", () => {
      const turnos = [makeTurnoVM({ clienteId: "7" })];
      expect(clienteYaTieneTurno(7, turnos)).toBe(true);
    });
  });

  describe("hayConflicto", () => {
    const turnoExistente = makeTurnoVM({
      fecha:           "2025-06-02",
      horaInicio:      "09:00",
      horaFin:         "09:30",
      clienteId:       1,
      tecnicoNombre:   "Carlos",
      tecnicoApellido: "López",
    });

    it("detecta conflicto por técnico en mismo horario", () => {
      expect(
        hayConflicto([turnoExistente], "2025-06-02", "09:00", "Carlos López", null, 1)
      ).toBe(true);
    });

    it("no hay conflicto si la fecha es diferente", () => {
      expect(
        hayConflicto([turnoExistente], "2025-06-03", "09:00", "Carlos López", null, 1)
      ).toBe(false);
    });

    it("no hay conflicto si el técnico es diferente", () => {
      expect(
        hayConflicto([turnoExistente], "2025-06-02", "09:00", "Ana García", null, 1)
      ).toBe(false);
    });

    it("no hay conflicto si el horario no se superpone", () => {
      expect(
        hayConflicto([turnoExistente], "2025-06-02", "10:00", "Carlos López", null, 1)
      ).toBe(false);
    });

    it("detecta conflicto por cliente en mismo horario", () => {
      expect(
        hayConflicto([turnoExistente], "2025-06-02", "09:00", "Otro Tecnico", 1, 1)
      ).toBe(true);
    });

    it("lista vacía nunca tiene conflicto", () => {
      expect(
        hayConflicto([], "2025-06-02", "09:00", "Carlos López", 1, 1)
      ).toBe(false);
    });
  });

  describe("filtrarClientesDisponibles", () => {
    it("excluye clientes que ya tienen turno", () => {
      const clientes = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const turnos   = [makeTurnoVM({ clienteId: 2 })];

      const result = filtrarClientesDisponibles(clientes, turnos);
      expect(result.map(c => c.id)).toEqual([1, 3]);
    });

    it("retorna todos si ninguno tiene turno", () => {
      const clientes = [{ id: 1 }, { id: 2 }];
      const result = filtrarClientesDisponibles(clientes, []);
      expect(result).toHaveLength(2);
    });
  });

  describe("filtrarPorRango", () => {
    const horarios = ["08:00", "09:00", "10:00", "12:00", "14:00", "16:00", "17:30"];

    it("filtra correctamente para AM (09:00 - 13:00, 1 bloque de 15 min)", () => {
      const result = filtrarPorRango(horarios, "AM", 1);
      result.forEach(h => {
        const [hr, min] = h.split(":").map(Number);
        const mins = hr * 60 + min;
        expect(mins).toBeGreaterThanOrEqual(9 * 60);
      });
    });

    it("filtra correctamente para PM (14:00 - 18:00)", () => {
      const result = filtrarPorRango(horarios, "PM", 1);
      result.forEach(h => {
        const [hr, min] = h.split(":").map(Number);
        const mins = hr * 60 + min;
        expect(mins).toBeGreaterThanOrEqual(14 * 60);
      });
    });

    it("retorna el array original si el rango no existe", () => {
      expect(filtrarPorRango(horarios, "NOCHE", 1)).toEqual(horarios);
    });
  });

  describe("obtenerHorariosDisponibles", () => {
    it("retorna bloques del técnico cuando no hay turnos", () => {
      const tecnico = makeTecnico();
      const result = obtenerHorariosDisponibles([], "2025-06-02", tecnico, "lunes");
      expect(result).toContain("09:00");
      expect(result).toContain("09:30");
      expect(result).toContain("10:00");
      expect(result).toContain("10:30");
    });

    it("excluye el bloque ocupado por un turno existente", () => {
      const tecnico = makeTecnico();
      const turnoOcupado = makeTurnoVM({
        fecha:           "2025-06-02",
        horaInicio:      "09:00",
        horaFin:         "09:30",
        tecnicoNombre:   "Carlos",
        tecnicoApellido: "López",
      });

      const result = obtenerHorariosDisponibles(
        [turnoOcupado], "2025-06-02", tecnico, "lunes"
      );

      expect(result).not.toContain("09:00");
      expect(result).toContain("09:30");
    });

    it("retorna array vacío si el día no está en los horarios del técnico", () => {
      const tecnico = makeTecnico();
      const result = obtenerHorariosDisponibles([], "2025-06-03", tecnico, "martes");
      expect(result).toEqual([]);
    });

    it("normaliza tildes en el nombre del día (miércoles → miercoles)", () => {
      const tecnico = makeTecnico({
        horarios: [{ dia: "miercoles", inicio: "10:00", fin: "11:00" }]
      });
      const result = obtenerHorariosDisponibles([], "2025-06-04", tecnico, "Miércoles");
      expect(result.length).toBeGreaterThan(0);
    });
  });
});