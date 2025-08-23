export class TurnoService {
  constructor(key = 'turnos') {
    this.key = key;
  }

  getAll() {
    const data = localStorage.getItem(this.key);
    if (!data) return [];  // 🔹 importante, retorna array vacío si no hay nada
    return JSON.parse(data);
  }
}
