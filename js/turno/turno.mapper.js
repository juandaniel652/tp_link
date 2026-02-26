export class TurnoMapper {

  static backendToDomain(turnoBackend) {
    return {
      clienteId: turnoBackend.cliente_id,
      tecnicoId: turnoBackend.tecnico_id,
      fecha: turnoBackend.fecha,
      inicio: parseInt(turnoBackend.hora_inicio),
      fin: parseInt(turnoBackend.hora_fin)
    };
  }

  static domainToBackend(turnoDomain) {
    return {
      cliente_id: turnoDomain.clienteId,
      tecnico_id: turnoDomain.tecnicoId,
      fecha: turnoDomain.fecha,
      hora_inicio: turnoDomain.inicio + ":00",
      hora_fin: turnoDomain.fin + ":00",
      estado: "Abierto"
    };
  }

}