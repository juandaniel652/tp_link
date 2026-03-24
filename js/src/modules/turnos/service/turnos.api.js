// ============================================================
// turnos.api.js — Acceso a la API REST de Turnos
// ============================================================
// Unifica apiTurnos.js + envioTicketPOST.js + storage.js
// ============================================================

import { API_BASE_URL } from "./turnos.constants.js";
import { tokenStorage } from "@/core/storage/tokenStorage.js";

const TURNOS_ENDPOINT = `${API_BASE_URL}/turnos`;

// ----------------------------------------------------------
// Helpers
// ----------------------------------------------------------

function authHeaders() {
  return {
    "Content-Type":  "application/json",
    "Authorization": `Bearer ${tokenStorage.getToken()}`,
  };
}

async function handleResponse(response) {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

// ----------------------------------------------------------
// GET
// ----------------------------------------------------------

/**
 * Obtiene todos los turnos.
 * @returns {Promise<Object[]>}
 */
export async function getTurnos() {
  const response = await fetch(TURNOS_ENDPOINT, {
    headers: authHeaders(),
  });
  return handleResponse(response);
}

/**
 * Obtiene turnos filtrados por fecha.
 * @param {string} fecha — "YYYY-MM-DD"
 * @returns {Promise<Object[]>}
 */
export async function getTurnosPorFecha(fecha) {
  const response = await fetch(`${TURNOS_ENDPOINT}?fecha=${fecha}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
}

// ----------------------------------------------------------
// POST
// ----------------------------------------------------------

/**
 * Crea un nuevo turno en el backend.
 * @param {Object} payload — objeto ya formateado para el backend
 * @returns {Promise<Object>} turno creado
 */
export async function crearTurno(payload) {
  const response = await fetch(`${TURNOS_ENDPOINT}/`, {
    method:  "POST",
    headers: authHeaders(),
    body:    JSON.stringify(payload),
  });
  return handleResponse(response);
}


// ----------------------------------------------------------
// PATCH — Actualizar estado
// ----------------------------------------------------------

/**
 * Actualiza el estado de un turno.
 * @param {string|number} id
 * @param {string} estado — "Cerrado" | "Reprogramación" | "Cancelado"
 * @returns {Promise<Object>} turno actualizado
 */
export async function actualizarEstadoTurno(id, estado) {
  const response = await fetch(`${TURNOS_ENDPOINT}/${id}/estado`, {
    method:  "PATCH",
    headers: authHeaders(),
    body:    JSON.stringify({ estado }),
  });
  return handleResponse(response);
}



// ----------------------------------------------------------
// PATCH — Cancelar
// ----------------------------------------------------------

/**
 * Cancela (soft-delete) un turno por ID.
 * @param {string|number} id
 * @returns {Promise<boolean>}
 */
export async function cancelarTurno(id) {
  const response = await fetch(`${TURNOS_ENDPOINT}/${id}/cancelar`, {
    method:  "PATCH",
    headers: authHeaders(),
  });
  await handleResponse(response);
  return true;
}


export async function obtenerDisponibilidad(tecnicoId, fecha) {
  const response = await fetch(
    `${TURNOS_ENDPOINT}/disponibilidad?tecnico_id=${tecnicoId}&fecha=${fecha}`,
    { headers: authHeaders() }
  );
  return handleResponse(response);
}