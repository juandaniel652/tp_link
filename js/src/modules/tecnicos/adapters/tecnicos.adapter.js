// tecnico.adapter.js

export function adaptDisponibilidadFromApi(d) {
  return {
    id: d.id,
    diaSemana: d.dia_semana,
    horaInicio: d.hora_inicio,
    horaFin: d.hora_fin
  };
}

export function adaptTecnicoFromApi(t) {
  return {
    id: t.id,
    nombre: t.nombre,
    email: t.email,
    telefono: t.telefono,
    disponibilidades: (t.disponibilidades || []).map(adaptDisponibilidadFromApi)
  };
}