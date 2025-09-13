// Manejo de localStorage

// Carga inicial desde localStorage
export function getData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

export function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
