// ============================================================
// turnos.constants.js — Constantes del módulo Turnos
// ============================================================

/** Valores posibles de T (cantidad de bloques de 15 minutos) */
export const T_VALUES = [1, 2, 3, 4, 5, 6];

/** Rangos horarios disponibles */
export const RANGOS = ["AM", "PM"];

/** Duración de cada bloque en minutos */
export const DURACION_BLOQUE_MIN = 15;

/** Límites horarios por rango (en minutos desde medianoche) */
export const LIMITES_RANGO = {
  AM: { inicio: 9 * 60,  fin: 13 * 60 },
  PM: { inicio: 14 * 60, fin: 18 * 60 },
};

/** Nombres de días de la semana (clave sin tilde → etiqueta con tilde) */
export const NOMBRES_DIAS = {
  domingo:  "Domingo",
  lunes:    "Lunes",
  martes:   "Martes",
  miercoles:"Miércoles",
  jueves:   "Jueves",
  viernes:  "Viernes",
  sabado:   "Sábado",
};

/** Orden canónico de los días (clave sin tilde) */
export const DAYS = [
  "domingo","lunes","martes","miercoles","jueves","viernes","sabado"
];

/** Mapa tipo_turno (integer) → etiqueta legible */
export const TIPOS_TURNO = {
  1: "T1",
  2: "T2",
  3: "T3",
  4: "T4",
  5: "T5",
  6: "T6"
};

/** Estados válidos de un turno */
export const ESTADOS_TURNO = {
  ABIERTO:   "Abierto",
  CERRADO:   "Cerrado",
  CANCELADO: "Cancelado",
};

/** URL base de la API propia */
export const API_BASE_URL = "https://andros-net.com.ar/api/api/v1";

/** URL base de la API de Andros */
export const ANDROS_API_URL = "https://andros-net.com.ar/api/api/v1";