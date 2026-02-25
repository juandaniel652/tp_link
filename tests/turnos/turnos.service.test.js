import { describe, it, expect } from 'vitest'
import { TurnosService } 
  from '@/modules/turnos/service/turnos.service.js'

describe('TurnosService', () => {

  it('crea turno si no hay conflicto', () => {

    const existentes = []

    const nuevo = TurnosService.crearTurno(existentes, {
      clienteId: 1,
      tecnicoId: 1,
      fecha: '2025-01-01',
      inicio: 10,
      fin: 11
    })

    expect(nuevo).toBeDefined()
    expect(nuevo.duracion()).toBe(1)
  })

  it('lanza error si hay conflicto', () => {

    const existentes = [
      {
        clienteId: 1,
        tecnicoId: 1,
        fecha: '2025-01-01',
        inicio: 10,
        fin: 11
      }
    ]

    expect(() => {
      TurnosService.crearTurno(existentes, {
        clienteId: 2,
        tecnicoId: 1,
        fecha: '2025-01-01',
        inicio: 10.5,
        fin: 11.5
      })
    }).toThrow('Conflicto de horario')
  })

})