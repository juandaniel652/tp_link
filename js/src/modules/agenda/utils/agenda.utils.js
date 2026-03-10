export function getFechaLunes(fecha) {
  const dia  = fecha.getDay();
  const diff = (dia === 0 ? -6 : 1) - dia;
  const lunes = new Date(fecha);
  lunes.setDate(fecha.getDate() + diff);
  lunes.setHours(0, 0, 0, 0);
  return lunes;
}

export function formatHora(h, m) {
  return `${pad(h)}:${pad(m % 60)}`;
}

export function pad(n) {
  return n.toString().padStart(2, '0');
}
