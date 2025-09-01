export let turnos = JSON.parse(localStorage.getItem("turnos")) || [];
export let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
export let naps = JSON.parse(localStorage.getItem("puntosAcceso")) || [];
export let tecnicos = JSON.parse(localStorage.getItem("tecnicos")) || [];

console.log(naps)

export function guardarTurnos() {
    localStorage.setItem("turnos", JSON.stringify(turnos));
}
