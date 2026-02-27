const API_BASE = "https://agenda-1-zomu.onrender.com/api/v1";

function buildHeaders(token, isFormData = false) {
  const headers = {
    Authorization: `Bearer ${token}`
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

export async function fetchTecnicos(token) {
  const response = await fetch(`${API_BASE}/tecnicos/`, {
    headers: buildHeaders(token)
  });

  const data = await response.json();

  if (!response.ok)
    throw new Error(data.detail || "Error obteniendo técnicos");

  return data;
}

export async function createTecnico(payload, token, isFormData = false) {
  const response = await fetch(`${API_BASE}/tecnicos/`, {
    method: "POST",
    headers: buildHeaders(token, isFormData),
    body: isFormData ? payload : JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok)
    throw new Error(data.detail || "Error creando técnico");

  return data;
}

export async function updateTecnico(id, payload, token, isFormData = false) {
  const response = await fetch(`${API_BASE}/tecnicos/${id}`, {
    method: "PUT",
    headers: buildHeaders(token, isFormData),
    body: isFormData ? payload : JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok)
    throw new Error(data.detail || "Error actualizando técnico");

  return data;
}

export async function deleteTecnico(id, token) {
  const response = await fetch(`${API_BASE}/tecnicos/${id}`, {
    method: "DELETE",
    headers: buildHeaders(token)
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Error eliminando técnico");
  }

  return true;
}