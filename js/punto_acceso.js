// punto_acceso.js 
document.addEventListener('DOMContentLoaded', () => {
  // === DOM ===
  const form = document.getElementById('formPuntoAcceso');
  const numeroInput = document.getElementById('numero');
  const diasGrid = document.getElementById('diasHorarioGrid');
  const puntosContainer = document.getElementById('puntosContainer');
  const btnGuardar = document.getElementById('btnGuardar');
  const btnCancelar = document.getElementById('btnCancelar');
  const btnAllAM = document.getElementById('selectAllAM');
  const btnAllPM = document.getElementById('selectAllPM');
  const btnAllBoth = document.getElementById('selectAllBoth');
  const btnClear = document.getElementById('clearAll');

  // === Constantes y estado ===
  const DAYS = ['lunes','martes','miercoles','jueves','viernes','sabado'];
  const NOMBRES_DIAS = { lunes:'Lunes', martes:'Martes', miercoles:'Miércoles', jueves:'Jueves', viernes:'Viernes', sabado:'Sábado' };

  let puntos = JSON.parse(localStorage.getItem('puntosAcceso')) || [];
  let editIndex = null;
  let selectionMap = {};

  function resetSelectionMap() {
    selectionMap = {};
    DAYS.forEach(d => selectionMap[d] = { AM: false, PM: false });
  }
  resetSelectionMap();

  function normalizeStoredPuntos() {
    let changed = false;
    puntos = puntos.map(p => {
      const copy = Object.assign({}, p);
      if (!Array.isArray(copy.horarios) || !copy.horarios.length) {
        const rango = copy.rango || copy.rangoHorario || null;
        const dias = Array.isArray(copy.dias) ? copy.dias : [];
        const horarios = [];
        if (rango && dias.length) {
          if (dias.includes('todos')) {
            DAYS.forEach(d => horarios.push({ dia: d, rango }));
          } else {
            dias.forEach(d => horarios.push({ dia: d, rango }));
          }
          changed = true;
        }
        copy.horarios = horarios;
        delete copy.rango; delete copy.dias; delete copy.rangoHorario;
      }
      copy.horarios = copy.horarios || [];
      copy.tecnicos = Array.isArray(copy.tecnicos) ? copy.tecnicos : [];
      return copy;
    });
    if (changed) localStorage.setItem('puntosAcceso', JSON.stringify(puntos));
  }
  normalizeStoredPuntos();

  function setLocalStorage() {
    localStorage.setItem('puntosAcceso', JSON.stringify(puntos));
  }

  function buildDaysGrid() {
    diasGrid.innerHTML = '';
    DAYS.forEach(dia => {
      const row = document.createElement('div');
      row.className = 'dia-row';
      row.dataset.dia = dia;
      row.innerHTML = `
        <span class="dia-name">${NOMBRES_DIAS[dia]}</span>
        <button type="button" class="range-btn" data-dia="${dia}" data-range="AM">AM</button>
        <button type="button" class="range-btn" data-dia="${dia}" data-range="PM">PM</button>
      `;
      diasGrid.appendChild(row);
    });

    diasGrid.querySelectorAll('.range-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const dia = btn.dataset.dia;
        const rango = btn.dataset.range;
        selectionMap[dia][rango] = !selectionMap[dia][rango];
        btn.classList.toggle('active', selectionMap[dia][rango]);
      });
    });
  }

  function updateGridUIFromSelection() {
    diasGrid.querySelectorAll('.range-btn').forEach(btn => {
      const dia = btn.dataset.dia;
      const rango = btn.dataset.range;
      btn.classList.toggle('active', !!selectionMap[dia][rango]);
    });
  }

  function setSelectionFromHorarios(horarios) {
    resetSelectionMap();
    horarios.forEach(h => {
      if (h && h.dia && h.rango && selectionMap[h.dia]) {
        selectionMap[h.dia][h.rango] = true;
      }
    });
    updateGridUIFromSelection();
  }

  function gatherHorariosFromSelection() {
    const out = [];
    DAYS.forEach(dia => {
      if (selectionMap[dia].AM) out.push({ dia, rango: 'AM' });
      if (selectionMap[dia].PM) out.push({ dia, rango: 'PM' });
    });
    return out;
  }

  function mergeHorarios(existing, nuevos) {
    const map = new Map();
    (existing || []).forEach(h => map.set(h.dia + '|' + h.rango, h));
    (nuevos || []).forEach(h => map.set(h.dia + '|' + h.rango, h));
    return Array.from(map.values());
  }

  function renderPuntos() {
    puntosContainer.innerHTML = '';

    if (puntos.length === 0) {
      puntosContainer.innerHTML = `<tr><td colspan="3" class="no-data">No hay NAPs registrados.</td></tr>`;
      return;
    }

    puntos.sort((a,b) => (Number(a.numero)||0) - (Number(b.numero)||0));

    puntos.forEach((p, idx) => {
      const row = document.createElement('tr');

      // Columna NAP
      const colNap = document.createElement('td');
      colNap.textContent = p.numero;

      // Columna Horarios combinados
      const colHorarios = document.createElement('td');
      const horarios = Array.isArray(p.horarios) ? p.horarios : [];
      colHorarios.innerHTML = horarios.length
        ? horarios.map(h => `${NOMBRES_DIAS[h.dia]} ${h.rango} ×`).join(' ')
        : '<em class="no-horarios">Sin horarios</em>';

      // Columna Acciones
      const colAcciones = document.createElement('td');
      colAcciones.innerHTML = `
        <button class="btn-edit">✏️ Editar</button>
        <button class="btn-delete">🗑 Eliminar</button>
        <button class="btn-view">👤 Técnicos</button>
      `;

      // Eventos
      colAcciones.querySelector('.btn-edit').addEventListener('click', () => {
        numeroInput.value = p.numero;
        setSelectionFromHorarios(p.horarios || []);
        editIndex = idx;
        btnGuardar.textContent = 'Actualizar';
        btnCancelar.classList.remove('hidden');
        numeroInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        numeroInput.focus();
      });

      colAcciones.querySelector('.btn-delete').addEventListener('click', () => {
        if (!confirm(`¿Eliminar NAP ${p.numero} y todos sus horarios?`)) return;
        puntos.splice(idx, 1);
        setLocalStorage();
        renderPuntos();
      });

      colAcciones.querySelector('.btn-view').addEventListener('click', () => {
        mostrarTecnicos(p);
      });

      row.appendChild(colNap);
      row.appendChild(colHorarios);
      row.appendChild(colAcciones);

      puntosContainer.appendChild(row);
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const numero = numeroInput.value.trim();

    if (!numero) { 
      alert('Ingrese un NAP válido.');
      return;
    }

    const horariosToSave = gatherHorariosFromSelection();
    if (!horariosToSave.length) {
      alert('Seleccione al menos una franja (AM/PM) en algún día.');
      return;
    }

    if (editIndex === null) {
      if (puntos.some(p => p.numero === numero)) {
        alert('Ese NAP ya existe. Usa editar para agregar o modificar horarios.');
        return;
      }
      puntos.push({ numero, horarios: horariosToSave, tecnicos: [] });
    } else {
      if (puntos.some((p, i) => p.numero === numero && i !== editIndex)) {
        alert('Ese NAP ya existe en otro registro.');
        return;
      }
      puntos[editIndex].numero = numero;
      puntos[editIndex].horarios = mergeHorarios(puntos[editIndex].horarios || [], horariosToSave);
      editIndex = null;
      btnGuardar.textContent = 'Guardar';
      btnCancelar.classList.add('hidden');
    }

    setLocalStorage();
    resetForm();
    renderPuntos();
  });

  btnAllAM?.addEventListener('click', () => {
    DAYS.forEach(d => selectionMap[d].AM = true);
    updateGridUIFromSelection();
  });
  btnAllPM?.addEventListener('click', () => {
    DAYS.forEach(d => selectionMap[d].PM = true);
    updateGridUIFromSelection();
  });
  btnAllBoth?.addEventListener('click', () => {
    DAYS.forEach(d => { selectionMap[d].AM = true; selectionMap[d].PM = true; });
    updateGridUIFromSelection();
  });
  btnClear?.addEventListener('click', () => {
    resetSelectionMap();
    updateGridUIFromSelection();
  });

  btnCancelar?.addEventListener('click', () => {
    editIndex = null;
    resetForm();
    btnGuardar.textContent = 'Guardar';
    btnCancelar.classList.add('hidden');
  });

  function resetForm() {
    form.reset();
    resetSelectionMap();
    updateGridUIFromSelection();
  }

  function mostrarTecnicos(punto) {
    const tecnicos = JSON.parse(localStorage.getItem('tecnicos')) || [];
    const tecnicosAsociados = tecnicos.filter(t =>
      Array.isArray(t.puntosAcceso) && t.puntosAcceso.includes(String(punto.numero))
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

  buildDaysGrid();
  resetForm();
  renderPuntos();
});
