import { ClienteController } from "./controller/clientes.controller.js";
import { ClientesView } from "./view/clientes.view.js";
import { tokenStorage } from "@/core/storage/tokenStorage.js";

export function initClientes() {

  const view = new ClientesView();

  const controller = new ClienteController({
    view,
    tokenProvider: tokenStorage
  });

  controller.init();
}