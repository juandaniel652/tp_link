// eventos.js
import { turnos, guardarTurnos } from "./state.js";
import { mostrarAlerta, renderTurnos } from "./ui.js";
import { generarHorasDisponibles, actualizarClientesDisponibles } from "./helpers.js";
import { esTurnoDuplicado, clienteYaTieneTecnico, clienteYaTieneTurnoConTecnico, seSolapanTurnos } from "./validaciones.js";

const formTurno = document.getElementById("formTurno");
const fechaInput = document.getElementById("turnoFecha");
const selectHora = document.getElementById("turnoHora");
const selectNap = document.getElementById("selectNap");
const selectCliente = document.getElementById("selectCliente");
const selectTecnico = document.getElementById("selectTecnico");
const selectT = document.getElementById("selectT");
const selectRango = document.getElementById("selectRango");
const selectEstadoTicket = document.getElementById("selectEstadoTicket");

export function registrarEventos() {
  selectTecnico.addEventListener("change", () => {
    generarHorasDisponibles();
    actualizarClientesDisponibles();
  });
  selectT.addEventListener("change", generarHorasDisponibles);
  selectRango.addEventListener("change", generarHorasDisponibles);

  fechaInput.addEventListener("change", () => {
    if (!fechaInput.value) return;
    const [year, month, day] = fechaInput.value.split("-").map(Number);
    const fechaSel = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (fechaSel < today) {
      mostrarAlerta("⚠️ No puedes elegir un día anterior a hoy.", "error");
      fechaInput.value = "";
      return;
    }
    if (fechaSel.getDay() === 0) {
      mostrarAlerta("⚠️ No se pueden sacar turnos los domingos.", "error");
      fechaInput.value = "";
      return;
    }

    generarHorasDisponibles();
    actualizarClientesDisponibles();
  });

  formTurno.addEventListener("submit", (e) => {
    e.preventDefault();

    const nuevoTurno = {
      fecha: fechaInput.value,
      hora: selectHora.value,
      nap: selectNap.value,
      cliente: selectCliente.value,
      tecnico: selectTecnico.value,
      t: `T${selectT.value}`,
      rango: selectRango.value,
      estado: selectEstadoTicket.value
    };

    if (!nuevoTurno.fecha || !nuevoTurno.hora || !nuevoTurno.nap || !nuevoTurno.cliente || !nuevoTurno.tecnico || !nuevoTurno.t || !nuevoTurno.rango || !nuevoTurno.estado) {
      mostrarAlerta("⚠️ Por favor, complete todos los campos.", "error");
      return;
    }

    if (esTurnoDuplicado(turnos, nuevoTurno)) {
      mostrarAlerta("❌ Ese turno ya está ocupado con este técnico.", "error");
      return;
    }

    if (clienteYaTieneTecnico(turnos, nuevoTurno)) {
      mostrarAlerta("❌ Un cliente solo puede tener un técnico asignado.", "error");
      return;
    }

    if (clienteYaTieneTurnoConTecnico(turnos, nuevoTurno)) {
      mostrarAlerta("⚠️ El cliente ya tiene turno con este técnico.", "error");
      return;
    }

    if (turnos.some((t) => seSolapanTurnos(t, nuevoTurno))) {
      mostrarAlerta("❌ Ese turno se solapa con otro del mismo técnico.", "error");
      return;
    }

    turnos.push(nuevoTurno);
    guardarTurnos();
    renderTurnos();
    formTurno.reset();
    generarHorasDisponibles();
    mostrarAlerta("✅ Turno registrado con éxito.", "success");
  });
}
