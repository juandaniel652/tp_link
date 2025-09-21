import StorageService from "./StorageService.js";

export default class TecnicoManager {
  constructor(storageKey = "tecnicos") {
    this.storageKey = storageKey;
    this.tecnicos = StorageService.get(this.storageKey);
  }

  obtenerTodos() {
    return this.tecnicos;
  }

  agregar(tecnico) {
    this.tecnicos.push(tecnico);
    this.guardar();
  }

  actualizar(indice, tecnico) {
    this.tecnicos[indice] = tecnico;
    this.guardar();
  }

  eliminar(indice) {
    this.tecnicos.splice(indice, 1);
    this.guardar();
  }

  guardar() {
    StorageService.set(this.storageKey, this.tecnicos);
  }
}
