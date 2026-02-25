import { TurnosController } 
  from '@/modules/turnos/controller/turnos.controller.js'

document.addEventListener('DOMContentLoaded', () => {
  new TurnosController().init()
})