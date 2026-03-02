import { bootstrapProtectedPage } from "@/core/auth/bootstrap.js";
import { ClienteController } from "@/modules/clientes/controller/clientes.controller.js";
import { ClientesView } from "@/modules/clientes/view/clientes.view.js";
import { tokenStorage } from "@/core/storage/tokenStorage.js";

document.addEventListener("DOMContentLoaded", () => {

  bootstrapProtectedPage(async () => {

    const view = new ClientesView();

    const controller = new ClienteController({
      view,
      tokenProvider: tokenStorage
    });

    await controller.init();
  });

});