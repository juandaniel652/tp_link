document.addEventListener('DOMContentLoaded', () => {
  // === Elementos del DOM ===
  const form = document.getElementById('formPuntoAcceso');
  const numeroInput = document.getElementById('numero');
  const rangoSelect = document.getElementById('rangoHorario');
  const chipsContainer = document.getElementById('diasTrabajo'); // <div> con chips
  const puntosContainer = document.getElementById('puntosContainer');
  const btnGuardar = document.getElementById('btnGuardar');
  const btnCancelar = document.getElementById('btnCancelar');

  // === Estado ===
  let puntos = JSON.parse(localStorage.getItem('puntosAcceso')) || [];
  let editIndex = null;
  let diasSeleccionados = ['todos']; // por defecto "Todos los días"

  // === Utilidades ===
  const NOMBRES_DIAS = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sábado',
  };

  function setLocalStorage() {
    localStorage.setItem('puntosAcceso', JSON.stringify(puntos));
  }

  function setChipsUIFromArray(arr) {
    diasSeleccionados = [...arr];
    const allChips = chipsContainer.querySelectorAll('.chip');
    allChips.forEach(chip => {
      const val = chip.dataset.value;
      if (diasSeleccionados.includes('todos')) {
        chip.classList.toggle('selected', val === 'todos');
      } else {
        chip.classList.toggle('selected', diasSeleccionados.includes(val));
      }
    });

    // Si quedó vacío, volvemos a "todos" para asegurar estado válido visual
    if (diasSeleccionados.length === 0) {
      diasSeleccionados = ['todos'];
      const chipTodos = chipsContainer.querySelector('[data-value="todos"]');
      allChips.forEach(c => c.classList.remove('selected'));
      if (chipTodos) chipTodos.classList.add('selected');
    }
  }

  function getDiasTexto(diasArr) {
    if (!Array.isArray(diasArr) || diasArr.length === 0 || diasArr.includes('todos')) {
      return 'Todos los días';
    }
    return diasArr.map(d => NOMBRES_DIAS[d] || d).join(', ');
  }

  // === Inicializar chips por defecto (seleccionar "todos") ===
  (function initChipsDefault() {
    const chipTodos = chipsContainer?.querySelector('[data-value="todos"]');
    if (chipTodos) chipTodos.classList.add('selected');
  })();

  // === Lógica de chips (click) ===
  chipsContainer.addEventListener('click', (e) => {
    const target = e.target;
    if (!target.classList.contains('chip')) return;

    const value = target.dataset.value;

    if (value === 'todos') {
      // Selecciona solo "todos"
      diasSeleccionados = ['todos'];
      chipsContainer.querySelectorAll('.chip').forEach(c => {
        c.classList.toggle('selected', c.dataset.value === 'todos');
      });
      return;
    }

    // Quitar "todos" si estaba
    diasSeleccionados = diasSeleccionados.filter(d => d !== 'todos');

    // Toggle del día
    if (diasSeleccionados.includes(value)) {
      diasSeleccionados = diasSeleccionados.filter(d => d !== value);
      target.classList.remove('selected');
    } else {
      diasSeleccionados.push(value);
      target.classList.add('selected');
    }

    // Si no quedó ninguno, volvemos a "todos"
    if (diasSeleccionados.length === 0) {
      diasSeleccionados = ['todos'];
      chipsContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
      const chipTodos = chipsContainer.querySelector('[data-value="todos"]');
      if (chipTodos) chipTodos.classList.add('selected');
    } else {
      // Asegurar que el chip "todos" quede desmarcado
      const chipTodos = chipsContainer.querySelector('[data-value="todos"]');
      if (chipTodos) chipTodos.classList.remove('selected');
    }
  });

  // === Render de tarjetas ===
  function renderPuntos() {
    puntosContainer.innerHTML = '';
    // ordenar por número asc
    puntos.sort((a, b) => (Number(a.numero) || 0) - (Number(b.numero) || 0));

    puntos.forEach((p, index) => {
      // compatibilidad con registros viejos
      const rango = p.rango || p.rangoHorario || '—';
      const dias = Array.isArray(p.dias) && p.dias.length ? p.dias : ['todos'];

      const card = document.createElement('div');
      card.className = 'punto-card';
      card.innerHTML = `
        <h3>NAP ${p.numero}</h3>
        <p><strong>Horario:</strong> ${rango}</p>
        <p><strong>Días:</strong> ${getDiasTexto(dias)}</p>
        <div class="actions">
          <button class="edit">Editar</button>
          <button class="delete">Eliminar</button>
          <button class="view">Ver Técnicos</button>
        </div>
      `;

      // editar
      card.querySelector('.edit').addEventListener('click', () => {
        numeroInput.value = p.numero;
        rangoSelect.value = rango !== '—' ? rango : '';

        setChipsUIFromArray(dias);

        editIndex = index;
        btnGuardar.textContent = 'Actualizar';
        btnCancelar.classList.remove('hidden');
      });

      // eliminar
      card.querySelector('.delete').addEventListener('click', () => {
        if (confirm(`¿Eliminar NAP ${p.numero}?`)) {
          puntos.splice(index, 1);
          setLocalStorage();
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

  // === Submit del formulario ===
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const numero = parseInt(numeroInput.value, 10);
    const rango = rangoSelect.value.trim();

    // Validaciones
    if (isNaN(numero) || numero <= 0 || numero > 999) {
      alert('Ingrese un número válido (1-999).');
      return;
    }
    if (!rango) {
      alert('Seleccione un rango horario (AM o PM).');
      return;
    }
    if (!diasSeleccionados.length) {
      alert('Seleccione al menos un día de trabajo.');
      return;
    }

    const duplicado = puntos.some((p, i) => p.numero === numero && i !== editIndex);
    if (duplicado) {
      alert('Ese número ya existe.');
      return;
    }

    // Si el usuario dejó "todos", guardamos ['todos'] como bandera;
    // si prefieres guardar los 6 días explícitos, cambia la línea siguiente por:
    // const diasAGuardar = diasSeleccionados.includes('todos')
    //   ? ['lunes','martes','miercoles','jueves','viernes','sabado']
    //   : [...diasSeleccionados];
    const diasAGuardar = [...diasSeleccionados];

    const registro = {
      numero,
      rango,
      dias: diasAGuardar,
      tecnicos: Array.isArray(puntos[editIndex]?.tecnicos) ? puntos[editIndex].tecnicos : []
    };

    if (editIndex !== null) {
      puntos[editIndex] = registro;
      editIndex = null;
      btnGuardar.textContent = 'Guardar';
      btnCancelar.classList.add('hidden');
    } else {
      // si no trae tecnicos, iniciar vacío para consistencia
      registro.tecnicos = [];
      puntos.push(registro);
    }

    setLocalStorage();
    resetForm();
    renderPuntos();
  });

  // === Cancelar edición ===
  btnCancelar.addEventListener('click', () => {
    editIndex = null;
    resetForm();
    btnGuardar.textContent = 'Guardar';
    btnCancelar.classList.add('hidden');
  });

  function resetForm() {
    form.reset();
    // reset chips a "todos"
    diasSeleccionados = ['todos'];
    chipsContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
    const chipTodos = chipsContainer.querySelector('[data-value="todos"]');
    if (chipTodos) chipTodos.classList.add('selected');
  }

  // === Modal de técnicos (igual a tu versión) ===
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
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  }

  // === Primer render ===
  renderPuntos();
});
