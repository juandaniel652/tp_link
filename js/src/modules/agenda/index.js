// js/src/modules/agenda/index.js
import { AgendaController } from './controller/agenda.controller.js';

export async function initAgenda() {
  console.log("[initAgenda] Iniciando módulo agenda...");

  const container = document.querySelector("#agendaContainer");
  if (!container) {
    console.warn("[initAgenda] #agendaContainer no encontrado en el DOM");
    return;
  }

  new AgendaController("agendaContainer");

  console.log("[initAgenda] AgendaController montado OK");
}

// ── re-exports ──────────────────────────────────────────────────
export { AgendaController }               from './controller/agenda.controller.js';
export { AgendaService }                  from './service/agenda.service.js';
export { agendaApi }                      from './service/agenda.api.js';
export { mapTurnoFromApi, mapTurnoToApi } from './mappers/agenda.mapper.js';
export { TurnoAgenda }                    from './model/agenda.model.js';
export { getFechaLunes, formatHora, pad } from './utils/agenda.utils.js';
