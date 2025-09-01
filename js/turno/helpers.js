// helpers.js
import { turnos, clientes } from "./state.js";
import { mostrarAlerta } from "./ui.js";

const fechaInput = document.getElementById("turnoFecha");
const selectHora = document.getElementById("turnoHora");
const selectTecnico = document.getElementById("selectTecnico");
const selectNap = document.getElementById('selectNap');
const selectT = document.getElementById("selectT");
const selectRango = document.getElementById("selectRango");
const selectCliente = document.getElementById("selectCliente");

export function generarHorasDisponibles() {
  selectHora.innerHTML = "<option value=''>Seleccione hora</option>";
  const fecha = fechaInput.value;
  const tecnico = selectTecnico.value;
  const bloquesT = parseInt(selectT.value) || 1;
  const rango = selectRango.value;
  if (!fecha || !tecnico || !rango) return;

  let horaInicio = rango === "AM" ? 9 : 14;
  let horaFin = rango === "AM" ? 13 : 18;

  for (let h = horaInicio; h < horaFin; h++) {
    for (let m = 0; m < 60; m += 15) {
      const inicioNuevo = h * 60 + m;
      const finNuevo = inicioNuevo + bloquesT * 15;
      if (finNuevo > horaFin * 60) continue;

      const seSolapa = turnos.some((t) => {
        if (t.fecha !== fecha || t.tecnico !== tecnico) return false;
        const durT = parseInt(t.t.replace("T", "")) * 15;
        const [hT, mT] = t.hora.split(":").map(Number);
        const inicioT = hT * 60 + mT;
        const finT = inicioT + durT;
        return inicioNuevo < finT && inicioT < finNuevo;
      });

      if (!seSolapa) {
        const hora = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        const option = document.createElement("option");
        option.value = hora;
        option.textContent = hora;
        selectHora.appendChild(option);
      }
    }
  }
}

export function actualizarClientesDisponibles() {
  if (!selectTecnico.value || !fechaInput.value) return;
  selectCliente.innerHTML = "<option value=''>Seleccione cliente</option>";
  const tecnico = selectTecnico.value;

  const clientesDisponibles = clientes.filter((c) => {
    const clienteId = `${c.numeroCliente} - ${c.nombre} ${c.apellido}`;
    const tieneOtroTecnico = turnos.some((t) => t.cliente === clienteId && t.tecnico !== tecnico);
    const yaConEsteTecnico = turnos.some((t) => t.cliente === clienteId && t.tecnico === tecnico);
    return !tieneOtroTecnico && !yaConEsteTecnico;
  });

  if (clientesDisponibles.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No hay clientes disponibles";
    selectCliente.appendChild(option);
  } else {
    clientesDisponibles.forEach((c) => {
      const option = document.createElement("option");
      option.value = `${c.numeroCliente} - ${c.nombre} ${c.apellido}`;
      option.textContent = option.value;
      selectCliente.appendChild(option);
    });
  }
}
