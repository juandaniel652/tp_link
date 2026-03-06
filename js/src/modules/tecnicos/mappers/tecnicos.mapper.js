// js/src/modules/tecnicos/mappers/tecnicos.mapper.js

// =========================
// ADAPTAR DE API A MODELO
// =========================
export function adaptTecnicoFromApi(data) {

  const DIAS_MAP = {
    1: "lunes",
    2: "martes",
    3: "miércoles",
    4: "jueves",
    5: "viernes",
    6: "sábado",
    7: "domingo"
  };

  const horarios = Array.isArray(data.horarios)
    ? data.horarios
        .filter(h => h.dia_semana !== 7) // eliminar domingo
        .map(h => ({
          dia_semana: h.dia_semana,
          inicio: (h.hora_inicio ?? "").slice(0,5),
          fin: (h.hora_fin ?? "").slice(0,5)
        }))
    : [];

  return {
    id: data.id,
    nombre: data.nombre ?? "",
    apellido: data.apellido ?? "",
    telefono: data.telefono ?? "",
    duracionTurnoMinutos: Number(data.duracion_turno_min ?? 0),
    email: data.email ?? "",
    imagen_url: data.imagen_url ?? "",
    horarios
  };
}

// =========================
// ADAPTAR DE MODELO A API
// =========================
export function adaptTecnicoToApi(tecnico) {
  return {
    nombre: tecnico.nombre,
    apellido: tecnico.apellido,
    telefono: tecnico.telefono || null,
    duracion_turno_min: Number(tecnico.duracionTurnoMinutos),
    email: tecnico.email || null,
    activo: true,
    horarios: tecnico.horarios.map(adaptDisponibilidadToApi)
  };
}

// =========================
// HORARIOS
// =========================
export function adaptDisponibilidadToApi(h) {
  return {
    dia_semana: h.dia_semana,
    hora_inicio: h.inicio?.length === 5 ? h.inicio + ":00" : h.inicio,
    hora_fin: h.fin?.length === 5 ? h.fin + ":00" : h.fin
  };
}