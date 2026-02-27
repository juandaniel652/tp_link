import { Turno } from "../model/turno.model.js";

/* FROM API */
export function mapTurnoFromApi(dto) {
  return new Turno({
    id: dto.id,
    numeroTicket: dto.numero_ticket,
    tipoTurno: dto.tipo_turno,
    rangoHorario: dto.rango_horario,
    estado: dto.estado,

    fecha: new Date(dto.fecha),
    horaInicio: dto.hora_inicio,
    horaFin: dto.hora_fin,

    cliente: mapCliente(dto.cliente),
    tecnico: mapTecnico(dto.tecnico)
  });
}

function mapCliente(clienteDto) {
  if (!clienteDto) return null;

  return {
    id: clienteDto.id,
    numeroCliente: clienteDto.numero_cliente,
    nombre: clienteDto.nombre
  };
}

function mapTecnico(tecnicoDto) {
  if (!tecnicoDto) return null;

  return {
    id: tecnicoDto.id,
    nombre: tecnicoDto.nombre
  };
}

/* ARRAY */
export function mapTurnosFromApi(data) {
  return data.map(mapTurnoFromApi);
}

/* TO API (CREATE) */
export function mapTurnoToApi(turno) {
  return {
    numero_ticket: turno.numeroTicket,
    cliente_id: turno.cliente.id,
    tecnico_id: turno.tecnico.id,
    tipo_turno: turno.tipoTurno,
    rango_horario: turno.rangoHorario,
    estado: turno.estado,
    fecha: turno.fecha.toISOString().split("T")[0],
    hora_inicio: turno.horaInicio,
    hora_fin: turno.horaFin
  };
}