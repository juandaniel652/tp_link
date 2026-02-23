export const UI_STATE = {

  DISPONIBILIDAD: "disponibilidad",

  HISTORIAL: "historial"

};

let currentState = null;

export function cambiarEstado(nuevoEstado, refs){

  if(currentState === nuevoEstado)
    return;

  currentState = nuevoEstado;

  const {
    turnosContainer,
    historialContainer,
    selectorFecha,
    titulo
  } = refs;

  // LIMPIAR SIEMPRE
  turnosContainer.innerHTML = "";
  historialContainer.innerHTML = "";

  switch(nuevoEstado){

    case UI_STATE.DISPONIBILIDAD:

      turnosContainer.style.display = "grid";

      historialContainer.style.display = "none";

      selectorFecha.style.display = "none";

      titulo.textContent =
        "Turnos Disponibles";

      break;


    case UI_STATE.HISTORIAL:

      turnosContainer.style.display = "none";

      historialContainer.style.display = "block";

      selectorFecha.style.display = "block";

      titulo.textContent =
        "Historial de Turnos";

      break;

  }

}