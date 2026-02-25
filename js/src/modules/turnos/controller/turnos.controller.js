import { TurnosService } 
  from '../service/turnos.service.js'

export class TurnosController {

  constructor() {
    this.turnos = []
  }

  init() {
    console.log('TurnosController inicializado')
  }

  crearTurno(datos) {

    const nuevo = TurnosService.crearTurno(
      this.turnos,
      datos
    )

    this.turnos.push(nuevo)

    return nuevo
  }

}