import { Turno } from '../model/turno.model.js';

export class TurnosService {

  static validarNuevoTurno(turnos, datos) {

    const nuevo = new Turno(datos);

    if (TurnosService.hayConflicto(turnos, nuevo)) {
      throw new Error("Conflicto de horario");
    }

    return true;
  }

  static hayConflicto(turnos, nuevo) {

    return turnos.some(t =>
      t.tecnicoId === nuevo.tecnicoId &&
      t.fecha === nuevo.fecha &&
      nuevo.inicio < t.fin &&
      nuevo.fin > t.inicio
    );

  }

}