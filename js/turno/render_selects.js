// render_selects.js
import { clienteYaTieneTurno } from "./validaciones.js";

export function renderSelectClientes(selectCliente, clientes, turnos = []) {

  selectCliente.innerHTML = `<option value="">Seleccionar Cliente</option>`;

  clientes.forEach(c => {

    const option = document.createElement("option");

    // ✅ usar ID del backend
    option.value = c.id;

    // mostrar nombre correctamente
    option.textContent = `${c.nombre} ${c.apellido}`;

    // verificar usando ID
    if (clienteYaTieneTurno(c.id, turnos)) {

      option.disabled = true;
      option.textContent += " (Ya tiene turno)";
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
