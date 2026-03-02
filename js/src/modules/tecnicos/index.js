import { TecnicosController } from "./controller/tecnicos.controller.js";
import { TecnicosView } from "./view/tecnicos.view.js";
import { tokenStorage } from "@/core/storage/tokenStorage.js";

export function initTecnicos() {

  const view = new TecnicosView();

  const controller = new TecnicosController({
    view,
    tokenProvider: tokenStorage
  });

  controller.init();
}