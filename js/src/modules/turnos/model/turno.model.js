export class Turno {
  constructor({
    id,
    numeroTicket,
    tipoTurno,
    rangoHorario,
    estado,
    fecha,
    horaInicio,
    horaFin,
    cliente,
    tecnico
  }) {
    this.id = id;
    this.numeroTicket = numeroTicket;
    this.tipoTurno = tipoTurno;
    this.rangoHorario = rangoHorario;
    this.estado = estado.toLowerCase();

    this.fecha = fecha;         // Date
    this.horaInicio = horaInicio;
    this.horaFin = horaFin;

    this.cliente = cliente;     // objeto dominio
    this.tecnico = tecnico;
  }

  estaCancelado() {
    return this.estado === "cancelado";
  }

  duraEnMinutos() {
    const [h1, m1] = this.horaInicio.split(":").map(Number);
    const [h2, m2] = this.horaFin.split(":").map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  }
}