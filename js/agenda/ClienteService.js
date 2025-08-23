// ClienteService.js
export class ClienteService {
  constructor(key = 'clientes') {
    this.key = key;
  }

  getAll() {
    return JSON.parse(localStorage.getItem(this.key)) || [];
  }
}
