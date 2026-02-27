import { bootstrapProtectedPage } from "@/core/auth/bootstrap.js";
import { TecnicoController } from "@/modules/tecnicos/controller/tecnicos.controller.js";
import { TecnicosView } from "@/modules/tecnicos/view/tecnicos.view.js";
import { tokenStorage } from "@/core/storage/tokenStorage.js";

document.addEventListener("DOMContentLoaded", () => {

  bootstrapProtectedPage(async () => {

    const view = new TecnicosView();

    const controller = new TecnicoController({
      view,
      tokenProvider: tokenStorage
    });

    await controller.init();
  });

});