document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formPuntoAcceso');
  const numeroInput = document.getElementById('numero');
  const puntosContainer = document.getElementById('puntosContainer');
  const btnGuardar = document.getElementById('btnGuardar');
  const btnCancelar = document.getElementById('btnCancelar');

  let puntos = JSON.parse(localStorage.getItem('puntosAcceso')) || [];
  let editIndex = null;

  renderPuntos();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const numero = parseInt(numeroInput.value);

    if (isNaN(numero) || numero <= 0 || numero > 999) {
      alert("Ingrese un número válido (1-999).");
      return;
    }

    const duplicado = puntos.some((p, i) => p.numero === numero && i !== editIndex);
    if (duplicado) {
      alert("Ese número ya existe.");
      return;
    }

    if (editIndex !== null) {
      puntos[editIndex].numero = numero;
      editIndex = null;
      btnGuardar.textContent = "Guardar";
      btnCancelar.classList.add("hidden");
    } else {
      // ⚡ guardamos con un array vacío de técnicos para asociar luego
      puntos.push({ numero, tecnicos: [] });
    }

    localStorage.setItem('puntosAcceso', JSON.stringify(puntos));
    numeroInput.value = '';
    renderPuntos();
  });

  btnCancelar.addEventListener('click', () => {
    editIndex = null;
    numeroInput.value = '';
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
        <h3>NAP ${p.numero}</h3>
        <div class="actions">
          <button class="edit">Editar</button>
          <button class="delete">Eliminar</button>
          <button class="view">Ver Técnicos</button>
        </div>
      `;

      // editar
      card.querySelector('.edit').addEventListener('click', () => {
        numeroInput.value = p.numero;
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
  // cargamos tecnicos desde localStorage
  const tecnicos = JSON.parse(localStorage.getItem('tecnicos')) || [];

  // filtramos los técnicos que tienen este NAP
  const tecnicosAsociados = tecnicos.filter(t =>
    Array.isArray(t.puntosAcceso) && t.puntosAcceso.includes(punto.numero)
  );

  // creamos modal dinámico
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

  // cerrar modal
  modal.querySelector('.cerrar-modal').addEventListener('click', () => {
    modal.remove();
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}


});
