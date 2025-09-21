import TecnicoManager from "./TecnicoManager.js";
import UIHandler from "./UIHandler.js";

export default class App {
  static init() {
    const manager = new TecnicoManager();
    const ui = new UIHandler("#formGeneral", "#generalContainer", manager);

    ui.limpiarFormulario();
    ui.renderTabla();
  }
}
