import { Turno } from '../model/turno.model.js'

export class TurnosService {

  static crearTurno(turnosExistentes, datosNuevoTurno) {

    if (!Array.isArray(turnosExistentes)) {
      throw new TypeError('turnosExistentes debe ser un array')
    }

    const nuevoTurno = new Turno(datosNuevoTurno)

    const conflicto = turnosExistentes
      .map(t => new Turno(t))
      .some(t => t.solapaCon(nuevoTurno))

    if (conflicto) {
      throw new Error('Conflicto de horario')
    }

    return nuevoTurno
  }

  static validarNuevoTurno(turnos, datos) {

    const nuevo = new Turno(datos);
    
    if (this.hayConflicto(turnos, nuevo)) {
      throw new Error("Conflicto de horario");
    }
  
    return true;
  }

}