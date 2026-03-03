// tecnico.adapter.js

export function mapTecnicoFromApi(apiData) {
  return {
    id: apiData.id,
    nombre: apiData.nombre,
    apellido: apiData.apellido,
    telefono: apiData.telefono,
    email: apiData.email,
    activo: apiData.activo,
    duracionTurnoMinutos: apiData.duracion_turno_min,
    horarios: (apiData.horarios || []).map(h => ({
      diaSemana: h.dia_semana,
      horaInicio: h.hora_inicio || null,
      horaFin: h.hora_fin || null,
    })),
    imagenUrl: apiData.imagen_url,
  };
}

export function adaptDisponibilidadFromApi(d) {
  return {
    id: d.id,
    diaSemana: d.dia_semana,
    horaInicio: d.hora_inicio,
    horaFin: d.hora_fin
  };
}

export function adaptDisponibilidadToApi(d) {
  return {
    id: d.id,
    dia_semana: d.diaSemana,
    hora_inicio: d.horaInicio,
    hora_fin: d.horaFin
  };
}

export function adaptTecnicoFromApi(t) {
  return {
    id: t.id,
    nombre: t.nombre,
    apellido: t.apellido,
    telefono: t.telefono,
    duracionTurnoMinutos: t.duracion_turno_min,
    email: t.email,
    activo: t.activo,
    imagen: t.imagen,
    horarios: (t.horarios || []).map(adaptDisponibilidadFromApi)
  };
}

export function adaptTecnicoToApi(t) {
  return {
    nombre: t.nombre,
    apellido: t.apellido,
    telefono: t.telefono,
    duracion_turno_min: t.duracionTurnoMinutos,
    email: t.email,
    activo: t.activo,
    horarios: (t.horarios || []).map(adaptDisponibilidadToApi)
  };
}