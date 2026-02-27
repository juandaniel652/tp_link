import { TecnicosView } from "../modules/tecnicos/view/tecnicos.view.js";
import { TecnicosController } from "../modules/tecnicos/controller/tecnicos.controller.js";
import { tokenStorage } from "../core/storage/tokenStorage.js";

// Esperar DOM
document.addEventListener("DOMContentLoaded", async () => {

  const view = new TecnicosView();

  const controller = new TecnicosController({
    view,
    tokenProvider: tokenStorage
  });

  await controller.init();

});