import { apiRequest } from '../../core/api/apiRequest.js';
import { mapTurnoFromApi, mapTurnoToApi } from '../mappers/agenda.mapper.js';

/**
 * Capa de acceso a la API REST para el módulo agenda.
 * Solo hace llamadas HTTP y devuelve datos mapeados.
 */
export const agendaApi = {

  /**
   * Obtiene todos los turnos del backend
   * @returns {Promise<TurnoAgenda[]>}
   */
  async obtenerTurnos() {
    const raw = await apiRequest('/turnos');
    return raw.map(mapTurnoFromApi);
  },

  /**
   * Crea un nuevo turno en el backend
   * @param {Object} datos - datos sin mapear
   * @returns {Promise<Object>}
   */
  async crearTurno(datos) {
    const payload = mapTurnoToApi(datos);
    return apiRequest('/turnos', {
      method: 'POST',
      body:   JSON.stringify(payload)
    });
  }

};