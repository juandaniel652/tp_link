export function formatearFecha(fechaISO) {

    const fecha = new Date(fechaISO);

    return fecha.toLocaleDateString("es-AR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

}

export function formatearHora(hora) {

    return hora.slice(0,5);

}

export function formatearEstado(estado) {

    return estado.charAt(0).toUpperCase() + estado.slice(1);

}

export function formatearTipo(tipo) {

    const mapa = {
        1: "Instalación",
        2: "Soporte técnico",
        3: "Mantenimiento",
        4: "Retiro",
        5: "Revisión",
        6: "Otro"
    };

    return mapa[tipo] || `Tipo ${tipo}`;

}

export function formatearTicket(numero_ticket){

    return numero_ticket.split("_")[1];

}