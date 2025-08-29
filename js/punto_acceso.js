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
      puntos.push({ numero });
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
        </div>
      `;

      card.querySelector('.edit').addEventListener('click', () => {
        numeroInput.value = p.numero;
        editIndex = index;
        btnGuardar.textContent = "Actualizar";
        btnCancelar.classList.remove("hidden");
      });

      card.querySelector('.delete').addEventListener('click', () => {
        if (confirm(`¿Eliminar NAP ${p.numero}?`)) {
          puntos.splice(index, 1);
          localStorage.setItem('puntosAcceso', JSON.stringify(puntos));
          renderPuntos();
        }
      });

      puntosContainer.appendChild(card);
    });
  }
});
