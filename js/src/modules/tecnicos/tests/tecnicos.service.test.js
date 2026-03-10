import { describe, it, expect, vi, beforeEach } from "vitest";
import TecnicosService from "../service/tecnicos.service.js";
import { tecnicosApi } from "../service/tecnicos.api.js";
import Tecnico from "../model/tecnico.model.js";

vi.mock("../service/tecnicos.api.js");

const rawTecnico = {
  id: 1,
  nombre: "Carlos",
  apellido: "López",
  telefono: "11223344",
  email: "c@mail.com",
  duracion_turno_min: 30,
  horarios: [{ dia_semana: 1, hora_inicio: "09:00", hora_fin: "17:00" }]
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("TecnicosService", () => {

  describe("obtenerTodos", () => {
    it("retorna un array de instancias Tecnico", async () => {
      tecnicosApi.obtenerTodos.mockResolvedValue([rawTecnico]);

      const result = await TecnicosService.obtenerTodos();

      expect(tecnicosApi.obtenerTodos).toHaveBeenCalledOnce();
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Tecnico);
      expect(result[0].nombre).toBe("Carlos");
    });
  });

  describe("obtenerPorId", () => {
    it("retorna una instancia Tecnico con el id correcto", async () => {
      tecnicosApi.obtenerPorId.mockResolvedValue(rawTecnico);

      const result = await TecnicosService.obtenerPorId(1);

      expect(tecnicosApi.obtenerPorId).toHaveBeenCalledWith(1);
      expect(result).toBeInstanceOf(Tecnico);
      expect(result.id).toBe(1);
    });
  });

  describe("crear", () => {
    it("llama a tecnicosApi.crear con el FormData del payload", async () => {
      tecnicosApi.crear.mockResolvedValue(rawTecnico);

      const payload = {
        nombre: "Carlos",
        apellido: "López",
        telefono: "11223344",
        email: "c@mail.com",
        duracion_turno_min: 30,
        horarios: []
      };

      await TecnicosService.crear(payload);

      expect(tecnicosApi.crear).toHaveBeenCalledOnce();
      const fd = tecnicosApi.crear.mock.calls[0][0];
      expect(fd).toBeInstanceOf(FormData);
      expect(fd.get("nombre")).toBe("Carlos");
    });
  });

  describe("actualizar", () => {
    it("llama a tecnicosApi.actualizar con el id y el FormData", async () => {
      tecnicosApi.actualizar.mockResolvedValue(rawTecnico);

      const payload = {
        nombre: "Carlos",
        apellido: "López",
        telefono: "11223344",
        email: "c@mail.com",
        duracion_turno_min: 30,
        horarios: []
      };

      await TecnicosService.actualizar(1, payload);

      expect(tecnicosApi.actualizar).toHaveBeenCalledOnce();
      const [id, fd] = tecnicosApi.actualizar.mock.calls[0];
      expect(id).toBe(1);
      expect(fd).toBeInstanceOf(FormData);
      expect(fd.get("apellido")).toBe("López");
    });
  });

  describe("eliminar", () => {
    it("llama a tecnicosApi.eliminar con el id correcto", async () => {
      tecnicosApi.eliminar.mockResolvedValue(true);

      const result = await TecnicosService.eliminar(1);

      expect(tecnicosApi.eliminar).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });
  });
});