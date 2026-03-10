// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BaseCrudView } from "../BaseCrudView.js";

// ─── Subclase concreta para testear ─────────────────────────────────────────

class TestCrudView extends BaseCrudView {
  buildRowCells(item) {
    return `<td>${item.nombre}</td>`;
  }

  _getFormData() {
    return { nombre: document.getElementById("nombre").value };
  }

  fillForm(item) {
    document.getElementById("nombre").value = item.nombre;
    this.enterEditMode(item.id);
  }
}

// ─── Setup del DOM ───────────────────────────────────────────────────────────

function setupDOM() {
  document.body.innerHTML = `
    <table><tbody id="testTable"></tbody></table>

    <form id="testForm">
      <input id="nombre" type="text" />
      <button type="submit">Guardar</button>
      <button type="button" id="btnCancel" style="display:none">Cancelar</button>
    </form>

    <div id="app"></div>
  `;

  return new TestCrudView({
    tableSelector: "#testTable",
    formSelector:  "#testForm"
  });
}

beforeEach(() => {
  document.body.innerHTML = "";
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("BaseCrudView", () => {

  describe("constructor", () => {
    it("asigna form y tableBody desde los selectores", () => {
      const view = setupDOM();
      expect(view.form).not.toBeNull();
      expect(view.tableBody).not.toBeNull();
    });

    it("_editingId es null al inicializar", () => {
      const view = setupDOM();
      expect(view._editingId).toBeNull();
    });

    it("btnCancel está presente si existe en el form", () => {
      const view = setupDOM();
      expect(view.btnCancel).not.toBeNull();
    });
  });

  describe("onSubmit", () => {
    it("llama al callback con los datos del form al hacer submit", () => {
      const view = setupDOM();
      const callback = vi.fn();
      view.onSubmit(callback);

      document.getElementById("nombre").value = "Juan";
      view.form.dispatchEvent(new Event("submit", { bubbles: true }));

      expect(callback).toHaveBeenCalledWith({ nombre: "Juan" }, null);
    });

    it("previene el comportamiento por defecto del submit", () => {
      const view = setupDOM();
      view.onSubmit(vi.fn());

      const event = new Event("submit", { bubbles: true, cancelable: true });
      view.form.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
    });

    it("pasa el _editingId actual como segundo argumento del callback", () => {
      const view = setupDOM();
      const callback = vi.fn();
      view.onSubmit(callback);

      view.enterEditMode(5);
      view.form.dispatchEvent(new Event("submit", { bubbles: true }));

      expect(callback).toHaveBeenCalledWith(expect.anything(), 5);
    });
  });

  describe("enterEditMode", () => {
    it("asigna _editingId", () => {
      const view = setupDOM();
      view.enterEditMode(3);
      expect(view._editingId).toBe(3);
    });

    it("cambia el texto del botón submit a 'Actualizar'", () => {
      const view = setupDOM();
      view.enterEditMode(3);
      expect(view.btnSubmit.textContent).toBe("Actualizar");
    });

    it("muestra el botón cancelar", () => {
      const view = setupDOM();
      view.enterEditMode(3);
      expect(view.btnCancel.style.display).toBe("inline-block");
    });
  });

  describe("exitEditMode", () => {
    it("resetea _editingId a null", () => {
      const view = setupDOM();
      view.enterEditMode(3);
      view.exitEditMode();
      expect(view._editingId).toBeNull();
    });

    it("cambia el texto del botón submit a 'Guardar'", () => {
      const view = setupDOM();
      view.enterEditMode(3);
      view.exitEditMode();
      expect(view.btnSubmit.textContent).toBe("Guardar");
    });

    it("oculta el botón cancelar", () => {
      const view = setupDOM();
      view.enterEditMode(3);
      view.exitEditMode();
      expect(view.btnCancel.style.display).toBe("none");
    });
  });

  describe("btnCancel click", () => {
    it("al hacer click en cancelar llama a exitEditMode", () => {
      const view = setupDOM();
      view.enterEditMode(9);

      view.btnCancel.click();

      expect(view._editingId).toBeNull();
      expect(view.btnSubmit.textContent).toBe("Guardar");
    });
  });

  describe("resetForm", () => {
    it("limpia los valores del formulario", () => {
      const view = setupDOM();
      document.getElementById("nombre").value = "texto";

      view.resetForm();

      expect(document.getElementById("nombre").value).toBe("");
    });
  });

  describe("renderError", () => {
    it("muestra el mensaje de error en #app", () => {
      const view = setupDOM();
      view.renderError("Error crítico");

      expect(document.querySelector("#app").innerHTML).toContain("Error crítico");
    });

    it("no lanza error si #app no existe (usa console.error)", () => {
      document.body.innerHTML = `
        <table><tbody id="testTable"></tbody></table>
        <form id="testForm">
          <input id="nombre" />
          <button type="submit">Guardar</button>
        </form>
      `;
      const view = new TestCrudView({
        tableSelector: "#testTable",
        formSelector: "#testForm"
      });

      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() => view.renderError("sin app")).not.toThrow();
      spy.mockRestore();
    });
  });

  describe("métodos abstractos", () => {
    it("_getFormData lanza error si no se implementa", () => {
      document.body.innerHTML = `
        <table><tbody id="t"></tbody></table>
        <form id="f"><button type="submit">ok</button></form>
      `;
      const base = new BaseCrudView({ tableSelector: "#t", formSelector: "#f" });
      expect(() => base._getFormData()).toThrow("Debes implementar _getFormData()");
    });

    it("fillForm lanza error si no se implementa", () => {
      document.body.innerHTML = `
        <table><tbody id="t"></tbody></table>
        <form id="f"><button type="submit">ok</button></form>
      `;
      const base = new BaseCrudView({ tableSelector: "#t", formSelector: "#f" });
      expect(() => base.fillForm()).toThrow("Debes implementar fillForm()");
    });
  });
});