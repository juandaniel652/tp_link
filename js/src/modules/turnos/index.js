import { TurnosController } from "./controller/turnos.controller.js";

export function initTurnos() {
  const controller = new TurnosController();
  controller.init();
}