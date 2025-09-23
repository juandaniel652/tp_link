// Render de selects (clientes, técnicos, T, Rango)

// Clientes
export function renderSelectClientes(selectCliente, clientes) {
  selectCliente.innerHTML = `<option value="">Seleccionar Cliente</option>`;
  clientes.forEach(c => {
    const option = document.createElement("option");
    option.value = String(c.numeroCliente);
    option.textContent = `${c.numeroCliente} - ${c.nombre} ${c.apellido}`.trim();
    selectCliente.appendChild(option);
  });
}

// render_selects.js
export function renderSelectTecnicos(select, tecnicos) {
  select.innerHTML = "<option value=''>Seleccionar Técnico</option>";

  tecnicos.forEach((tecnico, index) => {
    const option = document.createElement("option");
    option.value = index; // 👈 o usa tecnico.telefono si es único
    option.textContent = `${tecnico.nombre} ${tecnico.apellido}`;
    select.appendChild(option);
  });
}

// Genérico
export function renderSelectGen(selectEl, items, placeholder, prefix = "") {
  selectEl.innerHTML = `<option value="">${placeholder}</option>`;
  items.forEach(i => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = prefix + i;
    selectEl.appendChild(option);
  });
}
