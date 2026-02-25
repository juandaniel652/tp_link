export class Turno {
  constructor({ id = null, clienteId, tecnicoId, fecha, inicio, fin }) {

    if (!clienteId) {
      throw new Error('clienteId es obligatorio')
    }

    if (!tecnicoId) {
      throw new Error('tecnicoId es obligatorio')
    }

    if (!fecha) {
      throw new Error('fecha es obligatoria')
    }

    if (inicio == null || fin == null) {
      throw new Error('inicio y fin son obligatorios')
    }

    if (inicio >= fin) {
      throw new Error('inicio debe ser menor que fin')
    }

    this.id = id
    this.clienteId = Number(clienteId)
    this.tecnicoId = Number(tecnicoId)
    this.fecha = fecha
    this.inicio = Number(inicio)
    this.fin = Number(fin)
  }

  duracion() {
    return this.fin - this.inicio
  }

  solapaCon(otroTurno) {

      if (!(otroTurno instanceof Turno)) {
        throw new Error('Debe compararse con otra instancia de Turno')
      }
  
      if (this.tecnicoId !== otroTurno.tecnicoId) {
        return false
      }
  
      if (this.fecha !== otroTurno.fecha) {
        return false
      }
  
      return this.inicio < otroTurno.fin &&
             this.fin > otroTurno.inicio
    }
}