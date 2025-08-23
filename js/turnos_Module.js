document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formTurno');
  const clientesSelect = document.getElementById('selectCliente');
  const tecnicosSelect = document.getElementById('selectTecnico');
  const container = document.getElementById('turnosContainer');

  let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
  let tecnicos = JSON.parse(localStorage.getItem('tecnicos')) || [];
  let turnos = JSON.parse(localStorage.getItem('turnos')) || [];

  // Llenar select de técnicos
  function cargarSelects() {
    tecnicosSelect.innerHTML = '<option value="">Todos los Técnicos</option>';
    tecnicos.forEach(t => {
      const option = document.createElement('option');
      option.value = t.nombre + ' ' + t.apellido;
      option.textContent = t.nombre + ' ' + t.apellido;
      tecnicosSelect.appendChild(option);
    });

    filtrarClientes();
  }

  // Filtrar clientes según técnico seleccionado
  function filtrarClientes() {
    const tecnicoSeleccionado = tecnicosSelect.value;
    const clienteAnterior = clientesSelect.value; // Guardar selección previa
    clientesSelect.innerHTML = '<option value="">Seleccionar Cliente</option>';

    let clientesFiltrados;

    if (!tecnicoSeleccionado) {
      clientesFiltrados = clientes;
    } else {
      const clientesConTurno = turnos
        .filter(t => t.tecnico === tecnicoSeleccionado)
        .map(t => t.cliente);

      const nombresTodos = clientes.map(c => c.nombre + ' ' + c.apellido);
      clientesFiltrados = clientes.filter(c =>
        clientesConTurno.includes(c.nombre + ' ' + c.apellido) || nombresTodos.includes(c.nombre + ' ' + c.apellido)
      );
    }

    clientesFiltrados.forEach(c => {
      const option = document.createElement('option');
      option.value = c.nombre + ' ' + c.apellido;
      option.textContent = c.nombre + ' ' + c.apellido;
      if (option.value === clienteAnterior) option.selected = true; // Restaurar selección
      clientesSelect.appendChild(option);
    });
  }

  // Renderizar tarjetas de turnos
  function render() {
    container.innerHTML = '';
    turnos.forEach(t => {
      const card = document.createElement('div');
      card.classList.add('turno-card');
      card.innerHTML = `
        <h3>${t.cliente} - ${t.tecnico}</h3>
        <p>Fecha: ${t.fecha}</p>
        <p>Hora: ${t.hora}</p>
        <span class="turno-estado ${t.estado}">${t.estado}</span>
      `;
      container.appendChild(card);
    });
  }

  // Guardar turno
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const turno = {
      cliente: clientesSelect.value, // ya no se agrega "Cliente "
      tecnico: tecnicosSelect.value, // ya no se agrega "Técnico "
      fecha: document.getElementById('turnoFecha').value,
      hora: document.getElementById('turnoHora').value,
      estado: 'confirmado'
    };

    turnos.push(turno);
    localStorage.setItem('turnos', JSON.stringify(turnos));
    form.reset();
    render();
    filtrarClientes(); // actualizar clientes después de guardar
  });

  // Actualizar clientes al cambiar técnico
  tecnicosSelect.addEventListener('change', filtrarClientes);

  cargarSelects();
  render();
});
