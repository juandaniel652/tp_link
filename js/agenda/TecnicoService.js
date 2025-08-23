// TecnicoService.js
export class TecnicoService {
  constructor(key = 'tecnicos') {
    this.key = key;
  }

  getAll() {
    return JSON.parse(localStorage.getItem(this.key)) || [];
  }
}
