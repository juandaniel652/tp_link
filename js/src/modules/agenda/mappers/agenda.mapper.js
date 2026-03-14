import { TurnoAgenda } from '../model/agenda.model.js';

const COLORES_ESTADO = {
  pendiente:   '#f39c12',
  confirmado:  '#1E90FF',
  cancelado:   '#e74c3c',
  completado:  '#27ae60'
};

function colorPorEstado(estado) {
  return COLORES_ESTADO[estado] ?? '#7f8c8d';
}

/**
 * Transforma un turno crudo del backend en un TurnoAgenda
 * @param {Object} raw
 * @returns {TurnoAgenda}
 */
export function mapTurnoFromApi(raw) {
  return new TurnoAgenda({
    id:            raw.id,
    numero_ticket: raw.numero_ticket,
    fecha:         raw.fecha,
    hora_inicio:   raw.hora_inicio.slice(0, 5),
    hora_fin:      raw.hora_fin.slice(0, 5),
    cliente:       raw.cliente ?? null,
    tecnico: raw.tecnico
      ? {
          id:       raw.tecnico.id,
          nombre:   raw.tecnico.nombre,
          apellido: raw.tecnico.apellido,
          activo:   raw.tecnico.activo ?? true,  // ← dentro del objeto tecnico
        }
      : null,
    estado: raw.estado,
    color:  colorPorEstado(raw.estado),
  });
}

/**
 * Arma el payload para crear un turno en el backend
 * @param {Object} datos
 * @returns {Object}
 */
export function mapTurnoToApi(datos) {
  return {
    numero_ticket: `${datos.cliente_id}_${Date.now()}`,
    cliente_id:    datos.cliente_id,
    tecnico_id:    datos.tecnico_id,
    tipo_turno:    datos.tipo_turno  ?? 1,
    rango_horario: datos.rango_horario,
    estado:        datos.estado      ?? 'confirmado',
    fecha:         datos.fecha,
    hora_inicio:   datos.hora_inicio,
    hora_fin:      datos.hora_fin
  };
}