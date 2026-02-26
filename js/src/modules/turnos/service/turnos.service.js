// turnos.service.js
// Fachada del módulo Turnos

import { fetchTurnosPorFecha, postTurno } from "./turnos.api.js";
import {
  mapTurnoFromBackend,
  mapTurnoListFromBackend,
  mapTurnoToBackend
} from "../mappers/turnos.mapper.js";

/**
 * Obtiene turnos por fecha y los devuelve en formato Frontend Model
 */
export async function obtenerTurnosPorFecha({ fecha, token }) {
  try {
    const data = await fetchTurnosPorFecha({ fecha, token });
    return mapTurnoListFromBackend(data);
  } catch (error) {
    throw new Error(`TurnosService.obtenerTurnosPorFecha → ${error.message}`);
  }
}

/**
 * Crea un turno
 */
export async function crearTurno({ turno, token }) {
  try {
    const turnoBackend = mapTurnoToBackend(turno);
    const created = await postTurno({ turnoBackend, token });
    return mapTurnoFromBackend(created);
  } catch (error) {
    throw new Error(`TurnosService.crearTurno → ${error.message}`);
  }
}