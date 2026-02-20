import { getToken } from "../conexion_backend/tokenStorage.js";


const API_BASE = "https://agenda-1-zomu.onrender.com/api/v1";

export async function obtenerClientesBackend() {

    const token = getToken();

    console.log("TOKEN:", token);

    const response = await fetch(`${API_BASE}/clientes/`, {

        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }

    });

    console.log("STATUS:", response.status);

    const data = await response.json();

    console.log("RESPONSE DATA:", data);

    if (!response.ok)
        throw new Error(data.detail || "Error obteniendo clientes");

    return data;
}
