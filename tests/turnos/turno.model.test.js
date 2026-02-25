import { describe, it, expect } from 'vitest'
import { Turno } from '../../js/src/modules/turnos/model/turno.model.js'

describe('Turno Model', () => {
  it('debe crear un turno válido', () => {
    const turno = new Turno({
      id: '123',
      cliente_id: 'abc',
      tecnico_id: 'xyz'
    })

    expect(turno.id).toBe('123')
    expect(turno.cliente_id).toBe('abc')
  })
})