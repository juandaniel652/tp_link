import { describe, it, expect } from "vitest";
import { TurnosMapper } from "../mappers/turnos.mapper.js";
import { TurnoModel }   from "../model/turno.model.js";

const rawBackend = {
  id:            10,
  cliente_id:    1,
  tecnico_id:    2,
  fecha:         "2025-06-01",
  hora_inicio:   "09:00:00",
  hora_fin:      "09:30:00",
  tipo_turno:    2,
  rango_horario: "AM",
  estado:        "Abierto",
  numero_ticket: "1_99999",
  cliente: {
    id:             1,
    nombre:         "Juan",
    apellido:       "Pérez",
    numero_cliente: "C001",
  },
  tecnico: {
    id:       2,
    nombre:   "Carlos",
    apellido: "López",
  },
};

describe("TurnosMapper", () => {

  describe("backendToDomain", () => {
    it("retorna una instancia de TurnoModel", () => {
      const t = TurnosMapper.backendToDomain(rawBackend);
      expect(t).toBeInstanceOf(TurnoModel);
    });

    it("mapea los campos correctamente", () => {
      const t = TurnosMapper.backendToDomain(rawBackend);
      expect(t.id).toBe(10);
      expect(t.clienteId).toBe(1);
      expect(t.tecnicoId).toBe(2);
      expect(t.fecha).toBe("2025-06-01");
      expect(t.estado).toBe("Abierto");
    });

    it("recorta hora_inicio y hora_fin a HH:MM", () => {
      const t = TurnosMapper.backendToDomain(rawBackend);
      expect(t.horaInicio).toBe("09:00");
      expect(t.horaFin).toBe("09:30");
    });

    it("acepta cliente_id directo si no viene cliente anidado", () => {
      const raw = { ...rawBackend, cliente: undefined };
      const t = TurnosMapper.backendToDomain(raw);
      expect(t.clienteId).toBe(1);
    });
  });

  describe("domainToBackendPayload", () => {
    it("genera el payload con snake_case correcto", () => {
      const domain = new TurnoModel({
        clienteId: 1, tecnicoId: 2, fecha: "2025-06-01",
        horaInicio: "09:00", horaFin: "09:30",
        tipoTurno: 2, rangoHorario: "AM",
        estado: "Abierto", numeroTicket: "1_99999",
      });
      const payload = TurnosMapper.domainToBackendPayload(domain);
      expect(payload.cliente_id).toBe(1);
      expect(payload.tecnico_id).toBe(2);
      expect(payload.tipo_turno).toBe(2);
      expect(payload.rango_horario).toBe("AM");
      expect(payload.estado).toBe("Abierto");
    });

    it("agrega segundos ':00' a hora_inicio y hora_fin si miden 5 chars", () => {
      const domain = new TurnoModel({
        clienteId: 1, tecnicoId: 2, fecha: "2025-06-01",
        horaInicio: "09:00", horaFin: "09:30",
        tipoTurno: 1, rangoHorario: "AM", numeroTicket: "x"
      });
      const payload = TurnosMapper.domainToBackendPayload(domain);
      expect(payload.hora_inicio).toBe("09:00:00");
      expect(payload.hora_fin).toBe("09:30:00");
    });

    it("no duplica segundos si hora ya tiene 8 chars", () => {
      const domain = new TurnoModel({
        clienteId: 1, tecnicoId: 2, fecha: "2025-06-01",
        horaInicio: "09:00:00", horaFin: "09:30:00",
        tipoTurno: 1, rangoHorario: "AM", numeroTicket: "x"
      });
      const payload = TurnosMapper.domainToBackendPayload(domain);
      expect(payload.hora_inicio).toBe("09:00:00");
      expect(payload.hora_fin).toBe("09:30:00");
    });
  });

  describe("backendToViewModel", () => {
    it("genera un ViewModel plano con camelCase", () => {
      const vm = TurnosMapper.backendToViewModel(rawBackend);
      expect(vm.id).toBe(10);
      expect(vm.numeroTicket).toBe("1_99999");
      expect(vm.clienteId).toBe(1);
      expect(vm.clienteNombre).toBe("Juan");
      expect(vm.clienteNumero).toBe("C001");
      expect(vm.tecnicoId).toBe(2);
      expect(vm.tecnicoNombre).toBe("Carlos");
      expect(vm.tecnicoApellido).toBe("López");
      expect(vm.horaInicio).toBe("09:00");
      expect(vm.horaFin).toBe("09:30");
    });
  });

  describe("backendListToViewModels", () => {
    it("mapea un array completo a ViewModels", () => {
      const vms = TurnosMapper.backendListToViewModels([rawBackend, rawBackend]);
      expect(vms).toHaveLength(2);
      expect(vms[0].clienteNombre).toBe("Juan");
    });
  });

  describe("backendListToDomain", () => {
    it("mapea un array completo a instancias TurnoModel", () => {
      const lista = TurnosMapper.backendListToDomain([rawBackend]);
      expect(lista).toHaveLength(1);
      expect(lista[0]).toBeInstanceOf(TurnoModel);
    });
  });
});
