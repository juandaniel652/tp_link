import {
  NetworkError,
  UnauthorizedError,
  ValidationError
} from "./errors.js";

const API_BASE = "https://agenda-1-zomu.onrender.com/api/v1";
const TURNOS_ENDPOINT = `${API_BASE}/turnos`;

function buildHeaders(token) {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

function handleResponse(response) {
  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  if (response.status === 400) {
    throw new ValidationError("Invalid request");
  }

  if (!response.ok) {
    throw new NetworkError("Unexpected API error");
  }

  return response.json();
}

export async function fetchTurnosPorFecha({ fecha, token }) {
  const response = await fetch(
    `${TURNOS_ENDPOINT}?fecha=${fecha}`,
    { headers: buildHeaders(token) }
  );

  return handleResponse(response);
}

export async function postTurno({ turnoBackend, token }) {
  const response = await fetch(TURNOS_ENDPOINT, {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify(turnoBackend)
  });

  return handleResponse(response);
}

export async function obtenerTurnos() {
  const response = await fetch(TURNOS_URL);

  if (!response.ok)
    throw new Error("Error obteniendo turnos");

  return await response.json();
}

export async function obtenerTurnosPorFecha(fecha) {
  const response = await fetch(`${TURNOS_URL}?fecha=${fecha}`);

  if (!response.ok)
    throw new Error("Error obteniendo turnos por fecha");

  return await response.json();
}

export async function cancelarTurno(id) {
  const response = await fetch(`${TURNOS_URL}${id}/cancelar`, {
    method: "PATCH"
  });

  if (!response.ok)
    throw new Error("Error cancelando turno");

  return true;
}