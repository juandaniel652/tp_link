import { TURNOS_URL } from "./apiTurnos.js";
import { getToken } from "../conexion_backend/tokenStorage.js";

export async function enviarTurno(turno) {

    const token = getToken();

    const turnoBackend = {

        numero_ticket: turno.numero_ticket,

        cliente_id: turno.cliente_id,

        tecnico_id: turno.tecnico_id,

        // ✅ ahora integer directo desde frontend
        tipo_turno: turno.tipo_turno,

        // ✅ nueva propiedad
        rango_horario: turno.rango_horario,

        fecha: turno.fecha,

        hora_inicio: turno.hora_inicio + ":00",

        hora_fin: turno.hora_fin + ":00",

        estado: "pendiente"
    };

    console.log("ENVIANDO TURNO:", turnoBackend);

    const response = await fetch(TURNOS_URL, {

        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },

        body: JSON.stringify(turnoBackend)

    });

    if (!response.ok) {

        const error = await response.json();

        throw new Error(error.detail || "Error creando turno");

    }

    return await response.json();

}