// modules/tecnicos/mappers/tecnicos.mapper.js
import Tecnico from "../model/tecnico.model.js";

/**
 * Convierte la respuesta cruda de la API en una instancia de Tecnico.
 */
export function fromApi(raw) {
  const tecnico = new Tecnico(raw);
  tecnico._horariosRaw = raw.horarios ?? [];   // preservar formato API para la vista
  return tecnico;
}

/**
 * Convierte los datos del formulario en el payload que espera la API (FormData).
 * Se usa tanto para crear como para actualizar.
 */
export function toFormData(data) {
  const fd = new FormData();

  fd.append("nombre",           data.nombre);
  fd.append("apellido",         data.apellido);
  fd.append("duracion_turno_min", Number(data.duracion_turno_min));

  if (data.telefono)  fd.append("telefono",  data.telefono);
  if (data.email)     fd.append("email",     data.email);

  // Imagen: sólo adjuntar si es un File nuevo
  if (data.imagen instanceof File) fd.append("imagen", data.imagen);

  if (Array.isArray(data.horarios) && data.horarios.length)
    fd.append("horarios", JSON.stringify(data.horarios));

  return fd;
}