// ============================================================
// turnos.mapper.js — Conversión entre capas
// ============================================================
// Unifica adaptadores.js + turno.mapper.js (legado)
// ============================================================

import { TurnoModel } from "../model/turno.model.js";

export class TurnosMapper {

  // ----------------------------------------------------------
  // Backend → Dominio
  // ----------------------------------------------------------
  /**
   * Convierte la respuesta del backend en un TurnoModel de dominio.
   * @param {Object} raw — objeto crudo devuelto por la API
   * @returns {TurnoModel}
   */
  static backendToDomain(raw) {
    return new TurnoModel({
      id:           raw.id,
      clienteId:    raw.cliente_id ?? raw.cliente?.id,
      tecnicoId:    raw.tecnico_id ?? raw.tecnico?.id,
      fecha:        raw.fecha,
      horaInicio:   raw.hora_inicio?.slice(0, 5),
      horaFin:      raw.hora_fin?.slice(0, 5),
      tipoTurno:    raw.tipo_turno,
      rangoHorario: raw.rango_horario,
      estado:       raw.estado,
      numeroTicket: raw.numero_ticket,
    });
  }

  // ----------------------------------------------------------
  // Dominio → Payload para POST/PUT
  // ----------------------------------------------------------
  /**
   * Prepara el payload que espera el backend para crear/editar.
   * @param {TurnoModel} domain
   * @returns {Object}
   */
  static domainToBackendPayload(domain) {
    return {
      numero_ticket: domain.numeroTicket,
      cliente_id:    domain.clienteId,
      tecnico_id:    domain.tecnicoId,
      tipo_turno:    Number(domain.tipoTurno),
      rango_horario: domain.rangoHorario,
      fecha:         domain.fecha,
      hora_inicio:   domain.horaInicio.length === 5
                       ? domain.horaInicio + ":00"
                       : domain.horaInicio,
      hora_fin:      domain.horaFin.length === 5
                       ? domain.horaFin + ":00"
                       : domain.horaFin,
      estado:        domain.estado ?? "Abierto",
    };
  }

  // ----------------------------------------------------------
  // Backend → ViewModel (formato usado por la UI)
  // ----------------------------------------------------------
  /**
   * Produce el objeto "aplanado" que consumen las vistas.
   * @param {Object} raw
   * @returns {Object}
   */
  static backendToViewModel(raw) {
    return {
      id:             raw.id,
      numeroTicket:   raw.numero_ticket,
      fecha:          raw.fecha,
      horaInicio:     raw.hora_inicio?.slice(0, 5),
      horaFin:        raw.hora_fin?.slice(0, 5),
      clienteId:      raw.cliente?.id,
      clienteNombre:  raw.cliente?.nombre,
      clienteNumero:  raw.cliente?.numero_cliente,
      tecnicoId:      raw.tecnico?.id,
      tecnicoNombre:  raw.tecnico?.nombre,
      tecnicoApellido:raw.tecnico?.apellido,
      estado:         raw.estado,
      tipoTurno:      raw.tipo_turno,
      rangoHorario:   raw.rango_horario,
    };
  }

  /**
   * Convierte una lista de turnos del backend a ViewModels.
   * @param {Object[]} lista
   * @returns {Object[]}
   */
  static backendListToViewModels(lista) {
    return lista.map(TurnosMapper.backendToViewModel);
  }

  /**
   * Convierte una lista del backend a modelos de dominio.
   * @param {Object[]} lista
   * @returns {TurnoModel[]}
   */
  static backendListToDomain(lista) {
    return lista.map(TurnosMapper.backendToDomain);
  }
}