import { TurnosController } from "./modules/turnos/controller/turnos.controller.js";
import { TurnosView } from "./modules/turnos/view/turnos.view.js";

const view = new TurnosView();

const controller = new TurnosController({
  view,
  tokenProvider: {
    getToken: () => localStorage.getItem("token")
  }
});

controller.init();