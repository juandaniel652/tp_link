import { Tecnico } from "../model/tecnico.model.js";

export function mapTecnicoFromApi(dto) {
  return new Tecnico({
    id: dto.id,
    nombre: dto.nombre,
    apellido: dto.apellido,
    telefono: dto.telefono,
    duracionTurnoMinutos: dto.duracion_turno_min,
    email: dto.email,
    imagenUrl: dto.imagen_url,
    horarios: dto.horarios ?? [],
    activo: dto.activo
  });
}

export function mapTecnicoToApi(tecnico) {
  return {
    nombre: tecnico.nombre,
    apellido: tecnico.apellido,
    telefono: tecnico.telefono,
    duracion_turno_min: tecnico.duracionTurnoMinutos,
    email: tecnico.email,
    activo: tecnico.activo,
    horarios: tecnico.horarios
  };
}