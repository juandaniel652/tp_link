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

// Técnicos (reemplaza al de NAPs)
export function renderSelectTecnicos(selectTecnico, tecnicos) {
  selectTecnico.innerHTML = `<option value="">Seleccionar Técnico</option>`;
  tecnicos.forEach(t => {
    const option = document.createElement("option");
    option.value = String(t.id); // 👈 identificador único del técnico
    option.textContent = `${t.nombre} ${t.apellido || ""}`.trim();
    selectTecnico.appendChild(option);
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
