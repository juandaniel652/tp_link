import { TURNOS_URL } from "./apiTurnos.js";
import { getToken } from "../conexion_backend/tokenStorage.js";

export async function enviarTurno(turno) {

    const token = getToken();

    const TipoTurnoEnum = {
    CONSULTA: "consulta",
    CONTROL: "control",
    URGENCIA: "urgencia"
    };

    const EstadoTurnoEnum = {
    PENDIENTE: "pendiente",
    CONFIRMADO: "confirmado",
    CANCELADO: "cancelado",
    COMPLETADO: "completado"
    };


    const turnoBackend = {

        numero_ticket: turno.numero_ticket,

        cliente_id: turno.cliente_id,

        tecnico_id: turno.tecnico_id,

        tipo_turno: "regular",

        fecha: turno.fecha,

        hora_inicio: turno.hora_inicio + ":00",

        hora_fin: turno.hora_fin + ":00",

        estado: EstadoTurnoEnum.PENDIENTE

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
