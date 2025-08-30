// validaciones.js
export function esTurnoDuplicado(turnos, nuevo) {
  return turnos.some((t) => t.fecha === nuevo.fecha && t.hora === nuevo.hora && t.tecnico === nuevo.tecnico);
}

export function clienteYaTieneTecnico(turnos, nuevo) {
  return turnos.some((t) => t.cliente === nuevo.cliente && t.tecnico !== nuevo.tecnico);
}

export function clienteYaTieneTurnoConTecnico(turnos, nuevo) {
  return turnos.some((t) => t.cliente === nuevo.cliente && t.tecnico === nuevo.tecnico);
}

export function seSolapanTurnos(turnoA, turnoB) {
  if (turnoA.fecha !== turnoB.fecha || turnoA.tecnico !== turnoB.tecnico) return false;
  const durA = parseInt(turnoA.t.replace("T","")) * 15;
  const durB = parseInt(turnoB.t.replace("T","")) * 15;
  const [hA,mA] = turnoA.hora.split(":").map(Number);
  const [hB,mB] = turnoB.hora.split(":").map(Number);
  const inicioA = hA*60+mA;
  const finA = inicioA+durA;
  const inicioB = hB*60+mB;
  const finB = inicioB+durB;
  return inicioA < finB && inicioB < finA;
}
