document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formTecnico');
  const container = document.getElementById('tecnicosContainer');

  // Cargar técnicos desde localStorage o array vacío
  let tecnicos = JSON.parse(localStorage.getItem('tecnicos')) || [];

  // Función para renderizar tarjetas
  function render() {
    container.innerHTML = '';
    tecnicos.forEach(t => {
      const card = document.createElement('div');
      card.classList.add('tecnico-card');
      card.innerHTML = `
        <h3>${t.nombre} ${t.apellido}</h3>
        <p>Tel: ${t.telefono}</p>
      `;
      container.appendChild(card);
    });
  }

  // Guardar nuevo técnico
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const tecnico = {
      nombre: document.getElementById('tecnicoNombre').value,
      apellido: document.getElementById('tecnicoApellido').value,
      telefono: document.getElementById('tecnicoTelefono').value
    };
    tecnicos.push(tecnico);
    localStorage.setItem('tecnicos', JSON.stringify(tecnicos));
    form.reset();
    render();
  });

  // Render inicial
  render();
});
