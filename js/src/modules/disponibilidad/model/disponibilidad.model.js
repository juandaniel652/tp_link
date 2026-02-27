export class Disponibilidad {
  constructor({
    id = null,
    tecnicoId,
    diaSemana,
    horaInicio,
    horaFin
  }) {
    this.id = id;
    this.tecnicoId = tecnicoId;
    this.diaSemana = diaSemana;          // 0–6 o string normalizado
    this.horaInicio = horaInicio;        // "08:00"
    this.horaFin = horaFin;              // "12:00"
  }

  esValida() {
    if (!this.horaInicio || !this.horaFin) return false;
    return this.horaInicio < this.horaFin;
  }
}