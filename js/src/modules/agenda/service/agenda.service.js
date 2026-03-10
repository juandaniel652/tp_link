import { agendaApi } from './agenda.api.js';

/**
 * Servicio de negocio para la agenda.
 * Encapsula la lógica de dominio, orquesta llamadas a la API
 * y provee métodos reutilizables por el controller.
 */
export class AgendaService {

  async obtenerTodos() {
    return agendaApi.obtenerTurnos();
  }

  async crear(datos) {
    return agendaApi.crearTurno(datos);
  }

  /**
   * Construye un índice {fecha: {hora: [turnos]}} para acceso O(1) en la vista
   * @param {TurnoAgenda[]} turnos
   * @param {number} minutosBloque
   * @returns {Object}
   */
  indexarPorFechaHora(turnos, minutosBloque) {
    const index = {};

    for (const turno of turnos) {
      const fStr = turno.fecha.replace(/\//g, '-');
      const [hIni, mIni] = turno.hora_inicio.split(':').map(Number);

      const inicio = new Date(`2000-01-01T${turno.hora_inicio}`);
      const fin    = new Date(`2000-01-01T${turno.hora_fin}`);
      const bloques = (fin - inicio) / (minutosBloque * 60000);

      for (let b = 0; b < bloques; b++) {
        const totalMin  = hIni * 60 + mIni + b * minutosBloque;
        const bloqueKey = `${String(Math.floor(totalMin / 60)).padStart(2,'0')}:${String(totalMin % 60).padStart(2,'0')}`;

        index[fStr]             ??= {};
        index[fStr][bloqueKey]  ??= [];
        index[fStr][bloqueKey].push(turno);
      }
    }

    return index;
  }

  /**
   * Filtra clientes que tienen al menos un turno con el técnico indicado
   * @param {Object[]} clientes
   * @param {TurnoAgenda[]} turnos
   * @param {string} tecnicoFiltro  - "Nombre Apellido"
   * @returns {Object[]}
   */
  filtrarClientesPorTecnico(clientes, turnos, tecnicoFiltro) {
    if (!tecnicoFiltro) return clientes;

    const nombres = turnos
      .filter(t => {
        if (!t.tecnico) return false;
        return [t.tecnico.nombre, t.tecnico.apellido].filter(Boolean).join(' ') === tecnicoFiltro;
      })
      .map(t => [t.cliente?.nombre, t.cliente?.apellido].filter(Boolean).join(' '));

    const set = new Set(nombres);
    return clientes.filter(c => set.has(`${c.nombre} ${c.apellido}`.trim()));
  }
}