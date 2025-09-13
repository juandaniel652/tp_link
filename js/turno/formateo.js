// Funciones utilitarias de formateo (horas, fechas)
// Permita observar el horario con su rango y el tiempo que abarca el T (T1 = 15 minutos, T2 = 30 minutos, etc.)

// Devuelve string "09:00 - 09:30 (30 Minutos)"
// Formatea un rango horario según T
export function formatearRango(horaBase, tNum) {
  const [h, m] = horaBase.split(":").map(Number);

  const inicio = new Date();
  inicio.setHours(h, m);

  const fin = new Date(inicio);
  fin.setMinutes(inicio.getMinutes() + tNum * 15);

  const pad = (n) => n.toString().padStart(2,"0");
  const inicioStr = `${pad(inicio.getHours())}:${pad(inicio.getMinutes())}`;
  const finStr = `${pad(fin.getHours())}:${pad(fin.getMinutes())}`;

  const duracion = tNum * 15;
  return `${inicioStr} - ${finStr} (${duracion} Minutos)`;
}