const API_BASE = "https://agenda-1-zomu.onrender.com/api/v1";

export async function fetchClientes(token) {
  const response = await fetch(`${API_BASE}/clientes/`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  const data = await response.json();

  if (!response.ok)
    throw new Error(data.detail || "Error obteniendo clientes");

  return data;
}

export async function createCliente(payload, token) {
  const response = await fetch(`${API_BASE}/clientes/`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok)
    throw new Error(data.detail || "Error creando cliente");

  return data;
}

export async function updateCliente(id, payload, token) {
  const response = await fetch(`${API_BASE}/clientes/${id}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok)
    throw new Error(data.detail || "Error actualizando cliente");

  return data;
}

export async function deleteCliente(id, token) {
  const response = await fetch(`${API_BASE}/clientes/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Error eliminando cliente");
  }

  return true;
}