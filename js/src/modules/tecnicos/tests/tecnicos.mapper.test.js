import { describe, it, expect } from "vitest";
import { fromApi, toFormData } from "../mappers/tecnicos.mapper.js";
import Tecnico from "../model/tecnico.model.js";

const rawApi = {
  id: 2,
  nombre: "Ana",
  apellido: "García",
  telefono: "11 9876-5432",
  email: "ana@mail.com",
  duracion_turno_min: 45,
  activo: true,
  horarios: [
    { dia_semana: 2, hora_inicio: "10:00:00", hora_fin: "16:00:00" }
  ]
};

describe("tecnicos.mapper", () => {

  describe("fromApi", () => {
    it("retorna una instancia de Tecnico", () => {
      const t = fromApi(rawApi);
      expect(t).toBeInstanceOf(Tecnico);
    });

    it("mapea los campos correctamente", () => {
      const t = fromApi(rawApi);
      expect(t.nombre).toBe("Ana");
      expect(t.apellido).toBe("García");
      expect(t.email).toBe("ana@mail.com");
    });

    it("preserva _horariosRaw en formato API original", () => {
      const t = fromApi(rawApi);
      expect(t._horariosRaw).toEqual(rawApi.horarios);
    });

    it("_horariosRaw es array vacío si la API no manda horarios", () => {
      const { horarios, ...sinHorarios } = rawApi;
      const t = fromApi(sinHorarios);
      expect(t._horariosRaw).toEqual([]);
    });
  });

  describe("toFormData", () => {
    const data = {
      nombre: "Ana",
      apellido: "García",
      telefono: "11 9876-5432",
      email: "ana@mail.com",
      duracion_turno_min: 45,
      horarios: [{ dia_semana: 2, hora_inicio: "10:00", hora_fin: "16:00" }]
    };

    it("retorna una instancia de FormData", () => {
      const fd = toFormData(data);
      expect(fd).toBeInstanceOf(FormData);
    });

    it("incluye nombre, apellido y duración", () => {
      const fd = toFormData(data);
      expect(fd.get("nombre")).toBe("Ana");
      expect(fd.get("apellido")).toBe("García");
      expect(fd.get("duracion_turno_min")).toBe("45");
    });

    it("incluye telefono y email si están presentes", () => {
      const fd = toFormData(data);
      expect(fd.get("telefono")).toBe("11 9876-5432");
      expect(fd.get("email")).toBe("ana@mail.com");
    });

    it("NO incluye telefono ni email si están ausentes", () => {
      const { telefono, email, ...sinContacto } = data;
      const fd = toFormData(sinContacto);
      expect(fd.get("telefono")).toBeNull();
      expect(fd.get("email")).toBeNull();
    });

    it("incluye horarios como JSON string", () => {
      const fd = toFormData(data);
      expect(fd.get("horarios")).toBe(JSON.stringify(data.horarios));
    });

    it("NO incluye horarios si el array está vacío", () => {
      const fd = toFormData({ ...data, horarios: [] });
      expect(fd.get("horarios")).toBeNull();
    });

    it("NO incluye imagen si no es un File", () => {
      const fd = toFormData({ ...data, imagen: "https://url.com/foto.jpg" });
      expect(fd.get("imagen")).toBeNull();
    });

    it("incluye imagen si es una instancia de File", () => {
      const file = new File(["contenido"], "foto.jpg", { type: "image/jpeg" });
      const fd = toFormData({ ...data, imagen: file });
      expect(fd.get("imagen")).toBeInstanceOf(File);
    });
  });
});