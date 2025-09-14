// turnoService.js
function parseFechaISOToLocal(fechaISO) {
  const [y, m, d] = fechaISO.split("-").map(Number);
  return new Date(y, m - 1, d); // fecha en zona local a medianoche
}

export class TurnoService {
  constructor(key = 'turnos') {
    this.key = key;
  }

  getAll() {
    const data = localStorage.getItem(this.key);
    if (!data) return [];
    const arr = JSON.parse(data);
    // agrego fechaObj para evitar que el resto del código haga new Date("YYYY-MM-DD") incómodo
    return arr.map(t => ({ ...t, fechaObj: t.fecha ? parseFechaISOToLocal(t.fecha) : null }));
  }
}
