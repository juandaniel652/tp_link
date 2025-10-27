// clienteTabla.js
export class ClienteTabla {
  constructor(tablaBody, onEdit, onDelete) {
    this.tablaBody = tablaBody;
    this.onEdit = onEdit;
    this.onDelete = onDelete;
  }

  renderizar(clientes) {
    this.tablaBody.innerHTML = '';

    if (!clientes || clientes.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 7;
      td.className = "no-data";
      td.textContent = "No hay clientes registrados";
      tr.appendChild(td);
      this.tablaBody.appendChild(tr);
      return;
    }

    clientes.forEach((cliente, index) => {
      const tr = document.createElement('tr');
      tr.appendChild(this.crearTd(cliente.numeroCliente, "Número"));
      tr.appendChild(this.crearTd(cliente.nombre, "Nombre"));
      tr.appendChild(this.crearTd(cliente.apellido, "Apellido"));
      tr.appendChild(this.crearTd(cliente.telefono, "Teléfono"));
      tr.appendChild(this.crearTd(`${cliente.domicilio} ${cliente.numeroDomicilio}`, "Domicilio"));
      tr.appendChild(this.crearTd(cliente.email, "Email"));

      const tdAcciones = document.createElement('td');
      tdAcciones.dataset.label = "Acciones";

      const btnEditar = document.createElement('button');
      btnEditar.className = "btn-action edit";
      btnEditar.textContent = "✏️";
      btnEditar.addEventListener('click', () => this.onEdit(index));

      const btnEliminar = document.createElement('button');
      btnEliminar.className = "btn-action delete";
      btnEliminar.textContent = "🗑️";
      btnEliminar.addEventListener('click', () => this.onDelete(index));

      tdAcciones.appendChild(btnEditar);
      tdAcciones.appendChild(btnEliminar);
      tr.appendChild(tdAcciones);
      this.tablaBody.appendChild(tr);
    });
  }

  crearTd(contenido, label) {
    const td = document.createElement('td');
    td.dataset.label = label;
    td.textContent = contenido;
    return td;
  }
}
