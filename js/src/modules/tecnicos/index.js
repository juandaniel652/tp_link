// modules/tecnicos/index.js
import TecnicosController from "./controller/tecnicos.controller.js";

document.addEventListener("DOMContentLoaded", () => {
  const ctrl = new TecnicosController("#formGeneral", "#generalContainer");
  ctrl.init();
});