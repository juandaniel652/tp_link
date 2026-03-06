// js/src/modules/tecnicos/service/tecnicos.service.js
import { getToken } from "../conexion_backend/tokenStorage.js";
import { adaptTecnicoFromApi, adaptTecnicoToApi, adaptDisponibilidadToApi } from "../mappers/tecnicos.mapper.js";
import { fetchTecnicos } from "./tecnicos.api.js";

const API_BASE = "https://agenda-1-zomu.onrender.com/api/v1";

// =========================
// PETICIONES CRUD
// =========================
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = options.headers || {};
  headers["Authorization"] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) headers["Content-Type"] = "application/json";

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await response.json();

  if (!response.ok) throw new Error(data.detail || "Error en la petición");
  return data;
}

export async function obtenerTodos() {
  const data = await fetchTecnicos();
  return data.map(adaptTecnicoFromApi);
}

// =========================
// OBTENER TODOS
// =========================
export async function obtenerTecnicos() {
  const data = await apiRequest("/tecnicos");
  return data.map(adaptTecnicoFromApi);
}

// =========================
// CREAR
// =========================
export async function crearTecnico(tecnico) {

  if (tecnico.imagen instanceof File) {
    const formData = new FormData();
    formData.append("nombre", tecnico.nombre);
    formData.append("apellido", tecnico.apellido);
    if (tecnico.telefono) formData.append("telefono", tecnico.telefono);
    if (tecnico.email) formData.append("email", tecnico.email);
    formData.append("duracion_turno_min", tecnico.duracionTurnoMinutos);
    formData.append("activo", true);
    formData.append("imagen", tecnico.imagen);
    formData.append("horarios", JSON.stringify(tecnico.horarios.map(adaptDisponibilidadToApi)));

    const created = await apiRequest("/tecnicos", { method: "POST", body: formData });
    return adaptTecnicoFromApi(created);
  }

  // si no hay imagen
  const payload = adaptTecnicoToApi(tecnico);
  const created = await apiRequest("/tecnicos", { method: "POST", body: JSON.stringify(payload) });
  return adaptTecnicoFromApi(created);
}

// =========================
// ACTUALIZAR
// =========================
export async function actualizarTecnico(tecnico) {

  if (tecnico.imagen instanceof File) {
    const formData = new FormData();
    formData.append("nombre", tecnico.nombre);
    formData.append("apellido", tecnico.apellido);
    if (tecnico.telefono) formData.append("telefono", tecnico.telefono);
    if (tecnico.email) formData.append("email", tecnico.email);
    formData.append("duracion_turno_min", tecnico.duracionTurnoMinutos);
    formData.append("activo", true);
    formData.append("imagen", tecnico.imagen);
    formData.append("horarios", JSON.stringify(tecnico.horarios.map(adaptDisponibilidadToApi)));

    const updated = await apiRequest(`/tecnicos/${tecnico.id}`, { method: "PUT", body: formData });
    return adaptTecnicoFromApi(updated);
  }

  const payload = adaptTecnicoToApi(tecnico);
  const updated = await apiRequest(`/tecnicos/${tecnico.id}`, { method: "PUT", body: JSON.stringify(payload) });
  return adaptTecnicoFromApi(updated);
}

// =========================
// ELIMINAR
// =========================
export async function eliminarTecnico(id) {
  return apiRequest(`/tecnicos/${id}`, { method: "DELETE" });
}