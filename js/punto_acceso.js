document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formPuntoAcceso');
  const numeroInput = document.getElementById('numero');
  const rangoSelect = document.getElementById('rangoHorario'); // <-- referencia al select
  const puntosContainer = document.getElementById('puntosContainer');
  const btnGuardar = document.getElementById('btnGuardar');
  const btnCancelar = document.getElementById('btnCancelar');

  let puntos = JSON.parse(localStorage.getItem('puntosAcceso')) || [];
  let editIndex = null;

  renderPuntos();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const numero = parseInt(numeroInput.value);
    const rango = rangoSelect.value; // <-- obtenemos el rango seleccionado

    if (isNaN(numero) || numero <= 0 || numero > 999) {
      alert("Ingrese un número válido (1-999).");
      return;
    }
    if (!rango) {
      alert("Seleccione un rango horario (AM o PM).");
      return;
    }

    const duplicado = puntos.some((p, i) => p.numero === numero && i !== editIndex);
    if (duplicado) {
      alert("Ese número ya existe.");
      return;
    }

    if (editIndex !== null) {
      puntos[editIndex].numero = numero;
      puntos[editIndex].rango = rango; // <-- actualizamos el rango
      editIndex = null;
      btnGuardar.textContent = "Guardar";
      btnCancelar.classList.add("hidden");
    } else {
      puntos.push({ numero, rango, tecnicos: [] }); // <-- guardamos rango
    }

    localStorage.setItem('puntosAcceso', JSON.stringify(puntos));
    numeroInput.value = '';
    rangoSelect.value = ''; // <-- limpiar select
    renderPuntos();
  });

  btnCancelar.addEventListener('click', () => {
    editIndex = null;
    numeroInput.value = '';
    rangoSelect.value = '';
    btnGuardar.textContent = "Guardar";
    btnCancelar.classList.add("hidden");
  });

  function renderPuntos() {
    puntosContainer.innerHTML = '';
    puntos.sort((a,b) => a.numero - b.numero);

    puntos.forEach((p, index) => {
      const card = document.createElement('div');
      card.className = 'punto-card';
      card.innerHTML = `
        <h3>NAP ${p.numero} (${p.rango})</h3> <!-- <-- mostramos el rango -->
        <div class="actions">
          <button class="edit">Editar</button>
          <button class="delete">Eliminar</button>
          <button class="view">Ver Técnicos</button>
        </div>
      `;

      // editar
      card.querySelector('.edit').addEventListener('click', () => {
        numeroInput.value = p.numero;
        rangoSelect.value = p.rango; // <-- al editar, cargamos el rango
        editIndex = index;
        btnGuardar.textContent = "Actualizar";
        btnCancelar.classList.remove("hidden");
      });

      // eliminar
      card.querySelector('.delete').addEventListener('click', () => {
        if (confirm(`¿Eliminar NAP ${p.numero}?`)) {
          puntos.splice(index, 1);
          localStorage.setItem('puntosAcceso', JSON.stringify(puntos));
          renderPuntos();
        }
      });

      // ver técnicos
      card.querySelector('.view').addEventListener('click', () => {
        mostrarTecnicos(p);
      });

      puntosContainer.appendChild(card);
    });
  }

  // === Modal para mostrar técnicos ===
  function mostrarTecnicos(punto) {
    const tecnicos = JSON.parse(localStorage.getItem('tecnicos')) || [];
    const tecnicosAsociados = tecnicos.filter(t =>
      Array.isArray(t.puntosAcceso) && t.puntosAcceso.includes(punto.numero)
    );

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <h2>Técnicos de NAP ${punto.numero}</h2>
        <ul class="lista-tecnicos">
          ${
            tecnicosAsociados.length > 0
              ? tecnicosAsociados.map(t => `
                  <li>
                    <strong>${t.nombre} ${t.apellido}</strong><br>
                    📞 ${t.telefono}<br>
                    ⏱ ${t.duracionTurnoMinutos} min
                  </li>
                `).join('')
              : '<li>No hay técnicos asociados a este NAP.</li>'
          }
        </ul>
        <button class="cerrar-modal">Cerrar</button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.cerrar-modal').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if(e.target === modal) modal.remove(); });
  }

});
