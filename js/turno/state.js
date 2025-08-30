// state.js
export let turnos = JSON.parse(localStorage.getItem("turnos")) || [];
export let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
export let tecnicos = JSON.parse(localStorage.getItem("tecnicos")) || [];

export function guardarTurnos() {
    localStorage.setItem("turnos", JSON.stringify(turnos));
}
