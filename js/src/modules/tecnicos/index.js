// modules/tecnicos/index.js
import TecnicosController from "./controller/tecnicos.controller.js";

export function initTecnicos() {
  const ctrl = new TecnicosController("#formGeneral", "#generalContainer");
  ctrl.init();
}