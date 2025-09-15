// Render de selects (clientes, NAP, T, Rango)
// Permite observar las opciones disponibles en los selects del formulario
export function renderSelectClientes(selectCliente, clientes) {
  selectCliente.innerHTML = `<option value="">Seleccionar Cliente</option>`;
  clientes.forEach(c => {
    const option = document.createElement("option");
    option.value = String(c.numeroCliente);
    option.textContent = `${c.numeroCliente} - ${c.nombre} ${c.apellido}`.trim();
    selectCliente.appendChild(option);
  });
}

export function renderSelectNaps(selectNap, puntosAcceso) {
  selectNap.innerHTML = `<option value="">Seleccionar NAP</option>`;
  puntosAcceso.forEach(p => {
    const option = document.createElement("option");
    option.value = String(p.numero);
    option.textContent = `NAP ${p.numero}`;
    selectNap.appendChild(option);
  });
}

export function renderSelectGen(selectEl, items, placeholder, selectedValue) {
  selectEl.innerHTML = `<option value="">${placeholder}</option>`;
  items.forEach(i => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = selectedValue + i;
    selectEl.appendChild(option);
  });
}
