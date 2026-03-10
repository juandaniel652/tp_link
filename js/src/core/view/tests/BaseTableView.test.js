// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BaseTableView } from "../BaseTableView.js";

// ─── Subclase concreta para testear ─────────────────────────────────────────
// BaseTableView es abstracta (buildRowCells lanza error), así que
// la extendemos con una implementación mínima para los tests.

class TestTableView extends BaseTableView {
  buildRowCells(item) {
    return `<td>${item.nombre}</td>`;
  }
}

// ─── Setup del DOM ───────────────────────────────────────────────────────────

function setupDOM() {
  document.body.innerHTML = `<table><tbody id="testTable"></tbody></table>`;
  return new TestTableView("#testTable");
}

beforeEach(() => {
  document.body.innerHTML = "";
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("BaseTableView", () => {

  describe("constructor", () => {
    it("asigna tableBody correctamente desde el selector", () => {
      const view = setupDOM();
      expect(view.tableBody).not.toBeNull();
      expect(view.tableBody.id).toBe("testTable");
    });
  });

  describe("render", () => {
    it("renderiza una fila por cada item", () => {
      const view = setupDOM();
      view.render([{ id: 1, nombre: "Ana" }, { id: 2, nombre: "Luis" }]);

      const rows = view.tableBody.querySelectorAll("tr");
      expect(rows).toHaveLength(2);
    });

    it("muestra mensaje vacío si no hay items", () => {
      const view = setupDOM();
      view.render([]);

      expect(view.tableBody.innerHTML).toContain("No hay registros");
    });

    it("muestra mensaje vacío si items es null", () => {
      const view = setupDOM();
      view.render(null);

      expect(view.tableBody.innerHTML).toContain("No hay registros");
    });

    it("cada fila incluye botones de editar y eliminar", () => {
      const view = setupDOM();
      view.render([{ id: 1, nombre: "Ana" }]);

      const tr = view.tableBody.querySelector("tr");
      expect(tr.querySelector(".btn-edit")).not.toBeNull();
      expect(tr.querySelector(".btn-delete")).not.toBeNull();
    });

    it("botón editar llama a _onEdit con el id del item", () => {
      const view = setupDOM();
      const onEdit = vi.fn();
      view.onEdit(onEdit);

      view.render([{ id: 42, nombre: "Ana" }]);
      view.tableBody.querySelector(".btn-edit").click();

      expect(onEdit).toHaveBeenCalledWith(42);
    });

    it("botón eliminar llama a _onDelete con el id del item", () => {
      const view = setupDOM();
      const onDelete = vi.fn();
      view.onDelete(onDelete);

      view.render([{ id: 7, nombre: "Luis" }]);
      view.tableBody.querySelector(".btn-delete").click();

      expect(onDelete).toHaveBeenCalledWith(7);
    });

    it("no lanza error si _onEdit no está registrado", () => {
      const view = setupDOM();
      view.render([{ id: 1, nombre: "Ana" }]);

      expect(() => {
        view.tableBody.querySelector(".btn-edit").click();
      }).not.toThrow();
    });
  });

  describe("buildRowCells", () => {
    it("lanza error si no se implementa en la clase hija", () => {
      document.body.innerHTML = `<table><tbody id="testTable"></tbody></table>`;
      const base = new BaseTableView("#testTable");

      expect(() => base.buildRowCells({})).toThrow("Debes implementar buildRowCells");
    });
  });

  describe("showError", () => {
    it("muestra el mensaje de error en el tableBody", () => {
      const view = setupDOM();
      view.showError("Algo salió mal");

      expect(view.tableBody.innerHTML).toContain("Algo salió mal");
    });
  });
});