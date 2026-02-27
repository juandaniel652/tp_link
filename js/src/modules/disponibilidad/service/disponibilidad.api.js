const API_BASE = "https://agenda-1-zomu.onrender.com/api/v1";

function buildHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

export async function fetchDisponibilidad(tecnicoId, token) {
  const res = await fetch(
    `${API_BASE}/tecnicos/${tecnicoId}/disponibilidad`,
    { headers: buildHeaders(token) }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Error obteniendo disponibilidad");
  return data;
}

export async function createDisponibilidad(tecnicoId, payload, token) {
  const res = await fetch(
    `${API_BASE}/tecnicos/${tecnicoId}/disponibilidad`,
    {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify(payload)
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Error creando disponibilidad");
  return data;
}

export async function updateDisponibilidad(id, payload, token) {
  const res = await fetch(
    `${API_BASE}/disponibilidad/${id}`,
    {
      method: "PUT",
      headers: buildHeaders(token),
      body: JSON.stringify(payload)
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Error actualizando disponibilidad");
  return data;
}

export async function deleteDisponibilidad(id, token) {
  const res = await fetch(
    `${API_BASE}/disponibilidad/${id}`,
    {
      method: "DELETE",
      headers: buildHeaders(token)
    }
  );

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || "Error eliminando disponibilidad");
  }

  return true;
}