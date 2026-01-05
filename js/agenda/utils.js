// utils.js

/**
 * Devuelve la fecha del lunes de la semana de la fecha indicada
 * @param {Date} fecha
 * @returns {Date} lunes de la semana
 */

export const API_BASE_URL="https://agenda-uipe.onrender.com"

export function getFechaLunes(fecha) {
  const dia = fecha.getDay();
  const diff = (dia === 0 ? -6 : 1) - dia;
  const lunes = new Date(fecha);
  lunes.setDate(fecha.getDate() + diff);
  lunes.setHours(0,0,0,0);
  return lunes;
}

/**
 * Formatea una hora y minutos en HH:MM
 * @param {number} h 
 * @param {number} m 
 * @returns {string}
 */
export function formatHora(h, m) {
  return `${pad(h)}:${pad(m % 60)}`;
}

/**
 * Pone un número a 2 dígitos
 * @param {number} n 
 * @returns {string}
 */
export function pad(n) {
  return n.toString().padStart(2,'0');
}
