import { TurnosController } from "./controller/turnos.controller.js";
import { TurnosView } from "./view/turnos.view.js";

export function initTurnos() {
  const view = new TurnosView();

  const controller = new TurnosController({
    view,
    tokenProvider: {
      getToken: () => localStorage.getItem("token")
    }
  });

  controller.init();
}