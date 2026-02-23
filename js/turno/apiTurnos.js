import { getToken } from "../conexion_backend/tokenStorage.js";

const API_BASE = "https://agenda-1-zomu.onrender.com/api/v1";
const BASE_URL = "https://agenda-1-zomu.onrender.com/api/v1/turnos";

export const TURNOS_URL = `${API_BASE}/turnos/`;

export async function obtenerTurnosPorFecha(fecha){

    const token = getToken();

    const response = await fetch(
        `${BASE_URL}?fecha=${fecha}`,
        {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );

    if(!response.ok)
        throw new Error("Error obteniendo turnos");

    return await response.json();

}

