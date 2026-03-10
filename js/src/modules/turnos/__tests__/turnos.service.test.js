import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  cargarTurnos,
  cargarTurnosPorFecha,
  guardarTurno,
  cancelarTurnoById,
  validarNuevoTurno,
} from "../service/turnos.service.js";
import * as turnosApi       from "../service/turnos.api.js";
import * as disponibilidad  from "../service/disponibilidad.service.js";
import { TurnoModel }       from "../model/turno.model.js";
import {
  ConflictoHorarioError,
  CamposFaltantesError,
} from "../service/errors.js";

vi.mock("../service/turnos.api.js");
vi.mock("../service/disponibilidad.service.js");

// ─── Fixtures ────────────────────────────────────────────────────────────────

const rawBackend = {
  id:            1,
  numero_ticket: "1_111",
  fecha:         "2025-06-02",
  hora_inicio:   "09:00:00",
  hora_fin:      "09:30:00",
  cliente: { id: 1, nombre: "Juan", apellido: "Pérez", numero_cliente: "C001" },
  tecnico: { id: 2, nombre: "Carlos", apellido: "López" },
  estado:        "Abierto",
  tipo_turno:    2,
  rango_horario: "AM",
};

const turnoUIValido = {
  cliente_id:    1,
  tecnico_id:    2,
  fecha:         "2025-06-02",
  hora_inicio:   "09:00",
  hora_fin:      "09:30",
  tipo_turno:    2,
  rango_horario: "AM",
  estado:        "Abierto",
  numero_ticket: "1_111",
};

const tecnicoMock = { nombre: "Carlos", apellido: "López" };

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("turnos.service", () => {

  describe("cargarTurnos", () => {
    it("llama a getTurnos y retorna ViewModels", async () => {
      turnosApi.getTurnos.mockResolvedValue([rawBackend]);

      const result = await cargarTurnos();

      expect(turnosApi.getTurnos).toHaveBeenCalledOnce();
      expect(result).toHaveLength(1);
      expect(result[0].clienteNombre).toBe("Juan");
    });
  });

  describe("cargarTurnosPorFecha", () => {
    it("llama a getTurnosPorFecha con la fecha correcta y retorna ViewModels", async () => {
      turnosApi.getTurnosPorFecha.mockResolvedValue([rawBackend]);

      const result = await cargarTurnosPorFecha("2025-06-02");

      expect(turnosApi.getTurnosPorFecha).toHaveBeenCalledWith("2025-06-02");
      expect(result[0].fecha).toBe("2025-06-02");
    });
  });

  describe("guardarTurno", () => {
    it("crea el turno y retorna el ViewModel si no hay conflicto", async () => {
      disponibilidad.hayConflicto.mockReturnValue(false);
      turnosApi.crearTurno.mockResolvedValue(rawBackend);

      const result = await guardarTurno(turnoUIValido, [], tecnicoMock);

      expect(turnosApi.crearTurno).toHaveBeenCalledOnce();
      expect(result.clienteNombre).toBe("Juan");
    });

    it("lanza CamposFaltantesError si faltan campos obligatorios", async () => {
      const incompleto = { cliente_id: 1 }; // faltan muchos campos

      await expect(guardarTurno(incompleto, [], tecnicoMock))
        .rejects.toBeInstanceOf(CamposFaltantesError);
    });

    it("lanza ConflictoHorarioError si hayConflicto retorna true", async () => {
      disponibilidad.hayConflicto.mockReturnValue(true);

      await expect(guardarTurno(turnoUIValido, [], tecnicoMock))
        .rejects.toBeInstanceOf(ConflictoHorarioError);
    });

    it("usa el nombre del técnico del turnoUI si no se pasa tecnico", async () => {
      disponibilidad.hayConflicto.mockReturnValue(false);
      turnosApi.crearTurno.mockResolvedValue(rawBackend);

      const turnoConNombre = {
        ...turnoUIValido,
        tecnico_nombre: "Ana García",
      };

      await guardarTurno(turnoConNombre, [], null);

      expect(disponibilidad.hayConflicto).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        "Ana García",
        expect.anything(),
        expect.anything()
      );
    });
  });

  describe("cancelarTurnoById", () => {
    it("llama a cancelarTurno con el id correcto", async () => {
      turnosApi.cancelarTurno.mockResolvedValue(true);

      const result = await cancelarTurnoById(5);

      expect(turnosApi.cancelarTurno).toHaveBeenCalledWith(5);
      expect(result).toBe(true);
    });
  });

  describe("validarNuevoTurno", () => {
    it("no lanza error si no hay conflicto", () => {
      const t1 = new TurnoModel({
        clienteId: 1, tecnicoId: 2,
        fecha: "2025-06-02", horaInicio: "09:00", horaFin: "09:30",
        tipoTurno: 1, rangoHorario: "AM"
      });
      const t2 = new TurnoModel({
        clienteId: 3, tecnicoId: 4,
        fecha: "2025-06-02", horaInicio: "10:00", horaFin: "10:30",
        tipoTurno: 1, rangoHorario: "AM"
      });

      expect(() => validarNuevoTurno([t1], t2)).not.toThrow();
    });

    it("lanza ConflictoHorarioError si mismo cliente en el mismo día", () => {
      const existente = new TurnoModel({
        clienteId: 1, tecnicoId: 2,
        fecha: "2025-06-02", horaInicio: "09:00", horaFin: "09:30",
        tipoTurno: 1, rangoHorario: "AM"
      });
      const nuevo = new TurnoModel({
        clienteId: 1, tecnicoId: 3,
        fecha: "2025-06-02", horaInicio: "10:00", horaFin: "10:30",
        tipoTurno: 1, rangoHorario: "AM"
      });

      expect(() => validarNuevoTurno([existente], nuevo))
        .toThrow(ConflictoHorarioError);
    });

    it("lanza ConflictoHorarioError si mismo técnico con horario solapado", () => {
      const existente = new TurnoModel({
        clienteId: 1, tecnicoId: 2,
        fecha: "2025-06-02", horaInicio: "09:00", horaFin: "09:30",
        tipoTurno: 1, rangoHorario: "AM"
      });
      const nuevo = new TurnoModel({
        clienteId: 5, tecnicoId: 2,
        fecha: "2025-06-02", horaInicio: "09:15", horaFin: "09:45",
        tipoTurno: 1, rangoHorario: "AM"
      });

      expect(() => validarNuevoTurno([existente], nuevo))
        .toThrow(ConflictoHorarioError);
    });

    it("no lanza error si mismo técnico pero fechas distintas", () => {
      const existente = new TurnoModel({
        clienteId: 1, tecnicoId: 2,
        fecha: "2025-06-02", horaInicio: "09:00", horaFin: "09:30",
        tipoTurno: 1, rangoHorario: "AM"
      });
      const nuevo = new TurnoModel({
        clienteId: 5, tecnicoId: 2,
        fecha: "2025-06-03", horaInicio: "09:00", horaFin: "09:30",
        tipoTurno: 1, rangoHorario: "AM"
      });

      expect(() => validarNuevoTurno([existente], nuevo)).not.toThrow();
    });
  });
});