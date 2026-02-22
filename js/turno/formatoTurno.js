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
        consulta: "Consulta técnica",
        control: "Control",
        urgencia: "Urgencia"
    };

    return mapa[tipo] || tipo;

}

export function formatearTicket(numero_ticket){

    return numero_ticket.split("_")[1];

}