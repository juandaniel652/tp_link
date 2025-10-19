// ui.js

/**
 * Crea un select básico con estilos predeterminados
 * @returns {HTMLSelectElement}
 */
export function crearSelectBase() {
  const select = document.createElement('select');
  select.style.padding = '8px 14px';
  select.style.borderRadius = '12px';
  select.style.border = 'none';
  select.style.fontWeight = 'bold';
  select.style.fontSize = '14px';
  select.style.color = '#f0f0f0';
  select.style.background = 'linear-gradient(135deg, #1E3C72, #2A5298)';
  select.style.cursor = 'pointer';
  select.style.transition = '0.3s';
  return select;
}

/**
 * Crea un botón con estilo predeterminado para navegación
 * @param {string} texto 
 * @param {function} onClick 
 * @returns {HTMLButtonElement}
 */
export function crearBotonNavegar(texto, onClick) {
  const btn = document.createElement('button');
  btn.textContent = texto;
  btn.style.padding = '8px 14px';
  btn.style.borderRadius = '12px';
  btn.style.border = 'none';
  btn.style.fontWeight = 'bold';
  btn.style.fontSize = '14px';
  btn.style.cursor = 'pointer';
  btn.style.background = 'linear-gradient(135deg, #2A5298, #1E3C72)';
  btn.style.color = '#ffffff';
  btn.addEventListener('click', onClick);
  return btn;
}
