// services/clienteStorage.js
export class ClienteStorage {
  static key = 'clientes';

  static obtenerTodos() {
    return JSON.parse(localStorage.getItem(ClienteStorage.key)) || [];
  }

  static guardarTodos(clientes) {
    localStorage.setItem(ClienteStorage.key, JSON.stringify(clientes));
  }
}
