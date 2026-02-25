import { describe, it, expect } from 'vitest'
import { Turno } 
  from '@/modules/turnos/model/turno.model.js'

describe('Turno Model', () => {

  it('crea un turno válido', () => {
    const turno = new Turno({
      clienteId: 1,
      tecnicoId: 2,
      fecha: '2025-01-01',
      inicio: 10,
      fin: 11
    })

    expect(turno.clienteId).toBe(1)
    expect(turno.duracion()).toBe(1)
  })

  it('lanza error si inicio >= fin', () => {
    expect(() => {
      new Turno({
        clienteId: 1,
        tecnicoId: 2,
        fecha: '2025-01-01',
        inicio: 11,
        fin: 10
      })
    }).toThrow()
  })

  it('normaliza ids string a number', () => {
    const turno = new Turno({
      clienteId: "1",
      tecnicoId: "2",
      fecha: '2025-01-01',
      inicio: 9,
      fin: 10
    })

    expect(typeof turno.clienteId).toBe('number')
  })

  it('detecta solapamiento correctamente', () => {

      const a = new Turno({
        clienteId: 1,
        tecnicoId: 2,
        fecha: '2025-01-01',
        inicio: 10,
        fin: 12
      })

      const b = new Turno({
        clienteId: 3,
        tecnicoId: 2,
        fecha: '2025-01-01',
        inicio: 11,
        fin: 13
      })

      expect(a.solapaCon(b)).toBe(true)
    })

    it('no detecta solapamiento si tecnico distinto', () => {

      const a = new Turno({
        clienteId: 1,
        tecnicoId: 2,
        fecha: '2025-01-01',
        inicio: 10,
        fin: 12
      })
  
      const b = new Turno({
        clienteId: 3,
        tecnicoId: 3,
        fecha: '2025-01-01',
        inicio: 11,
        fin: 13
      })
  
      expect(a.solapaCon(b)).toBe(false)
    })

})