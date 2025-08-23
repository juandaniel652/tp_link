document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formCliente');
  const container = document.getElementById('clientesContainer');

  // Cargar clientes desde localStorage o array vacío
  let clientes = JSON.parse(localStorage.getItem('clientes')) || [];

  // Función para renderizar tarjetas
  function render() {
    container.innerHTML = '';
    clientes.forEach(c => {
      const card = document.createElement('div');
      card.classList.add('cliente-card');
      card.innerHTML = `
        <h3>${c.nombre} ${c.apellido}</h3>
        <p>Tel: ${c.telefono}</p>
      `;
      container.appendChild(card);
    });
  }

  // Guardar nuevo cliente
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const cliente = {
      nombre: document.getElementById('clienteNombre').value,
      apellido: document.getElementById('clienteApellido').value,
      telefono: document.getElementById('clienteTelefono').value
    };
    clientes.push(cliente);
    localStorage.setItem('clientes', JSON.stringify(clientes));
    form.reset();
    render();
  });

  // Render inicial
  render();
});
