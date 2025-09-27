import StorageService from "./StorageService.js";
import Tecnico from "./Tecnico.js";

export default class TecnicoManager {
  constructor(storageKey = "tecnicos") {
    this.storageKey = storageKey;
    // 🔹 Reconstruir instancias de Tecnico al cargar desde storage
    const data = StorageService.get(this.storageKey);
    this.tecnicos = data.map(t => new Tecnico(t));
  }

  obtenerTodos() {
    return this.tecnicos;
  }

  obtener(indice) {
    return this.tecnicos[indice];
  }

  agregar(tecnico) {
    if (Tecnico.validar(tecnico)) {
      this.tecnicos.push(tecnico);
      this.guardar();
      return true;
    }
    return false;
  }

  actualizar(indice, tecnico) {
    if (indice >= 0 && indice < this.tecnicos.length && Tecnico.validar(tecnico)) {
      this.tecnicos[indice] = tecnico;
      this.guardar();
      return true;
    }
    return false;
  }

  eliminar(indice) {
    if (indice >= 0 && indice < this.tecnicos.length) {
      this.tecnicos.splice(indice, 1);
      this.guardar();
    }
  }

  guardar() {
    // 🔹 Guardamos como objetos simples (sin métodos de clase)
    StorageService.set(this.storageKey, this.tecnicos);
  }
}
