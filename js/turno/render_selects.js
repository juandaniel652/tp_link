// render_selects.js
import { clienteYaTieneTurno } from "./validaciones.js";

// Clientes
export function renderSelectClientes(selectCliente, clientes, turnos = []) {
  selectCliente.innerHTML = `<option value="">Seleccionar Cliente</option>`;

  clientes.forEach(c => {
    const option = document.createElement("option");
    option.value = String(c.numeroCliente);
    option.textContent = `${c.numeroCliente} - ${c.nombre} ${c.apellido}`.trim();

    // Si el cliente ya tiene turno, deshabilitamos la opción y agregamos etiqueta
    if (clienteYaTieneTurno(c.numeroCliente, turnos)) {
      option.disabled = true;
      option.textContent += " (Ya tiene turno)";
      // opcional: agregar clase para estilos
      option.classList.add("opcion-desactivada");
    }

    selectCliente.appendChild(option);
  });
}

// Render técnicos (igual que antes)
export function renderSelectTecnicos(select, tecnicos) {
  select.innerHTML = "<option value=''>Seleccionar Técnico</option>";
  tecnicos.forEach((tecnico, index) => {
    const option = document.createElement("option");
    option.value = index;
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
