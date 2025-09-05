document.addEventListener('DOMContentLoaded', () => {
  const formulario = document.getElementById('formGeneral');
  const contenedor = document.getElementById('generalContainer');
  const chipsContainer = document.getElementById('puntosAcceso');

  let registros = JSON.parse(localStorage.getItem('tecnicos')) || [];
  let indiceEdicion = null;

  const inputs = {
    nombre: document.getElementById('nombre'),
    apellido: document.getElementById('apellido'),
    telefono: document.getElementById('telefono'),
    duracion: document.getElementById('duracionTurno'),
    punto: chipsContainer
  };

  /** =====================
   *  Cargar puntos de acceso
   *  ===================== */
  function cargarPuntosAcceso() {
    const puntos = JSON.parse(localStorage.getItem("puntosAcceso")) || [];
    chipsContainer.innerHTML = '';
    puntos.forEach(puntoObj => {
      const label = document.createElement("label");
      label.classList.add("chip");

      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = String(puntoObj.numero);

      const span = document.createElement("span");
      span.textContent = `NAP ${puntoObj.numero}`;

      label.appendChild(input);
      label.appendChild(span);
      chipsContainer.appendChild(label);
    });
  }

  /** =====================
   *  Limpiar formulario
   *  ===================== */
  function limpiarCamposFormulario() {
    inputs.nombre.value = "";
    inputs.apellido.value = "";
    inputs.duracion.value = "";
    inputs.telefono.value = "";
    [...chipsContainer.querySelectorAll("input[type='checkbox']")].forEach(chk => chk.checked = false);
    indiceEdicion = null;
    formulario.querySelector("button[type='submit']").textContent = "Guardar Técnico";
  }

  /** =====================
   *  Renderizar tabla
   *  ===================== */
  function render() {
    contenedor.innerHTML = '';

    if (registros.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="6" class="no-data">No hay registros</td>`;
      contenedor.appendChild(tr);
      return;
    }

    registros.forEach((r, index) => {
      const tr = document.createElement('tr');
      const naps = Array.isArray(r.puntosAcceso) ? r.puntosAcceso.join(', ') : '';
      tr.innerHTML = `
          <td data-label="Nombre">${r.nombre}</td>
          <td data-label="Apellido">${r.apellido}</td>
          <td data-label="Teléfono">${r.telefono}</td>
          <td data-label="Duración turno">${r.duracionTurnoMinutos}</td>
          <td data-label="Puntos de acceso">${naps}</td>
          <td data-label="Acciones" class="actions">
            <button class="btn-action edit">✏️</button>
            <button class="btn-action delete">🗑️</button>
          </td>
        `;

      tr.querySelector(".edit").addEventListener("click", () => {
        indiceEdicion = index;
        const registro = registros[index];
        inputs.nombre.value = registro.nombre;
        inputs.apellido.value = registro.apellido;
        inputs.telefono.value = registro.telefono;
        inputs.duracion.value = registro.duracionTurnoMinutos;
        [...chipsContainer.querySelectorAll("input[type='checkbox']")].forEach(chk => {
          chk.checked = registro.puntosAcceso.includes(chk.value);
        });
        formulario.querySelector("button[type='submit']").textContent = "Guardar Cambios";
        formulario.scrollIntoView({ behavior: "smooth" });
      });

      tr.querySelector(".delete").addEventListener("click", () => {
        if (confirm(`¿Seguro que quieres eliminar a ${r.nombre} ${r.apellido}?`)) {
          registros.splice(index, 1);
          localStorage.setItem("tecnicos", JSON.stringify(registros));
          render();
        }
      });

      contenedor.appendChild(tr);
    });
  }

  /** =====================
   *  Guardar o actualizar registro
   *  ===================== */
  formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    const registro = {
      nombre: inputs.nombre.value.trim(),
      apellido: inputs.apellido.value.trim(),
      telefono: inputs.telefono.value.trim(),
      duracionTurnoMinutos: inputs.duracion.value.trim(),
      puntosAcceso: [...chipsContainer.querySelectorAll("input[type='checkbox']:checked")].map(chk => chk.value)
    };

    if (!registro.nombre || !registro.apellido || !registro.telefono || !registro.duracionTurnoMinutos) {
      alert("Todos los campos son obligatorios");
      return;
    }

    if (indiceEdicion !== null) {
      registros[indiceEdicion] = registro;
      indiceEdicion = null;
    } else {
      registros.push(registro);
    }

    localStorage.setItem('tecnicos', JSON.stringify(registros));
    limpiarCamposFormulario();
    render();
  });

  /** =====================
   *  Inicialización
   *  ===================== */
  cargarPuntosAcceso();
  limpiarCamposFormulario();
  render();
});
