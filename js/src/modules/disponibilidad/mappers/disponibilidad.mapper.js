import { Disponibilidad } from "../model/disponibilidad.model.js";

export function mapDisponibilidadFromApi(dto) {
  return new Disponibilidad({
    id: dto.id,
    tecnicoId: dto.tecnico_id,
    diaSemana: dto.dia_semana,
    horaInicio: dto.hora_inicio,
    horaFin: dto.hora_fin
  });
}

export function mapDisponibilidadToApi(entity) {
  return {
    tecnico_id: entity.tecnicoId,
    dia_semana: entity.diaSemana,
    hora_inicio: entity.horaInicio,
    hora_fin: entity.horaFin
  };
}