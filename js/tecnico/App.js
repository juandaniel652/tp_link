import UIHandler from "./UIHandler.js";

export default class App {
  static init() {
    const ui = new UIHandler("#formGeneral", "#generalContainer");
    ui.limpiarFormulario();
    ui.renderTabla();
  }
}
