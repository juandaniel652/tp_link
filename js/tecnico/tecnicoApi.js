const API_BASE = "https://agenda-1-zomu.onrender.com/api/v1";

export async function obtenerTecnicosBackend() {

    const response = await fetch(`${API_BASE}/tecnicos/`);

    if (!response.ok)
        throw new Error("Error obteniendo tecnicos");

    return await response.json();
}
