const API_BASE = "https://agenda-1-zomu.onrender.com/api/v1";

export async function obtenerClientesBackend() {

    const response = await fetch(`${API_BASE}/clientes/`);

    if (!response.ok)
        throw new Error("Error obteniendo clientes");

    return await response.json();
}
