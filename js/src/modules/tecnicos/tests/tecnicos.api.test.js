import { describe, it, expect, vi, beforeEach } from "vitest";
import { tecnicosApi } from "../service/tecnicos.api.js";
import * as apiRequest from "../../../core/api/apiRequest.js";

vi.mock("../../../core/api/apiRequest.js");

const rawTecnico = {
  id: 1,
  nombre: "Carlos",
  apellido: "López",
  telefono: "11223344",
  email: "c@mail.com",
  duracion_turno_min: 30,
  horarios: []
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("tecnicos.api", () => {

  it("obtenerTodos llama a apiRequest con /tecnicos", async () => {
    apiRequest.apiRequest.mockResolvedValue([rawTecnico]);

    const result = await tecnicosApi.obtenerTodos();

    expect(apiRequest.apiRequest).toHaveBeenCalledWith("/tecnicos");
    expect(result).toEqual([rawTecnico]);
  });

  it("obtenerPorId llama a apiRequest con /tecnicos/:id", async () => {
    apiRequest.apiRequest.mockResolvedValue(rawTecnico);

    const result = await tecnicosApi.obtenerPorId(1);

    expect(apiRequest.apiRequest).toHaveBeenCalledWith("/tecnicos/1");
    expect(result).toEqual(rawTecnico);
  });

  it("crear llama a apiRequest con POST y el formData", async () => {
    apiRequest.apiRequest.mockResolvedValue(rawTecnico);
    const fd = new FormData();

    await tecnicosApi.crear(fd);

    expect(apiRequest.apiRequest).toHaveBeenCalledWith("/tecnicos", {
      method: "POST",
      body: fd
    });
  });

  it("actualizar llama a apiRequest con PUT y el id correcto", async () => {
    apiRequest.apiRequest.mockResolvedValue(rawTecnico);
    const fd = new FormData();

    await tecnicosApi.actualizar(1, fd);

    expect(apiRequest.apiRequest).toHaveBeenCalledWith("/tecnicos/1", {
      method: "PUT",
      body: fd
    });
  });

  it("eliminar llama a apiRequest con DELETE y el id correcto", async () => {
    apiRequest.apiRequest.mockResolvedValue(true);

    await tecnicosApi.eliminar(1);

    expect(apiRequest.apiRequest).toHaveBeenCalledWith("/tecnicos/1", {
      method: "DELETE"
    });
  });
});