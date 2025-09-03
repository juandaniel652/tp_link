document.addEventListener('DOMContentLoaded', () => {
  const formulario = document.getElementById('formTecnico');
  const contenedor = document.getElementById('tecnicosContainer');
  const chipsContainer = document.getElementById('puntoAcceso');

  let tecnicos = JSON.parse(localStorage.getItem('tecnicos')) || [];
  let indiceEdicion = null;

  const inputs = {
    nombre: document.getElementById('tecnicoNombre'),
    apellido: document.getElementById('tecnicoApellido'),
    telefono: document.getElementById('tecnicoTelefono'),
    duracion: document.getElementById('duracionTurnoMinutos'),
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

    if (tecnicos.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="6" class="no-data">No hay técnicos registrados</td>`;
      contenedor.appendChild(tr);
      return;
    }

    tecnicos.forEach((t, index) => {
      const tr = document.createElement('tr');
      const naps = Array.isArray(t.puntosAcceso) ? t.puntosAcceso.join(', ') : '';
      tr.innerHTML = `
        <td>${t.nombre}</td>
        <td>${t.apellido}</td>
        <td>${t.telefono}</td>
        <td>${t.duracionTurnoMinutos}</td>
        <td>${naps}</td>
        <td class="acciones">
          <button class="btn-accion editar">✏️</button>
          <button class="btn-accion eliminar">🗑️</button>
        </td>
      `;

      tr.querySelector(".editar").addEventListener("click", () => {
        indiceEdicion = index;
        const tecnico = tecnicos[index];
        inputs.nombre.value = tecnico.nombre;
        inputs.apellido.value = tecnico.apellido;
        inputs.telefono.value = tecnico.telefono;
        inputs.duracion.value = tecnico.duracionTurnoMinutos;
        [...chipsContainer.querySelectorAll("input[type='checkbox']")].forEach(chk => {
          chk.checked = tecnico.puntosAcceso.includes(chk.value);
        });
        formulario.querySelector("button[type='submit']").textContent = "Guardar Cambios";
        formulario.scrollIntoView({ behavior: "smooth" });
      });

      tr.querySelector(".eliminar").addEventListener("click", () => {
        if (confirm(`¿Seguro que quieres eliminar al técnico ${t.nombre} ${t.apellido}?`)) {
          tecnicos.splice(index, 1);
          localStorage.setItem("tecnicos", JSON.stringify(tecnicos));
          render();
        }
      });

      contenedor.appendChild(tr);
    });
  }

  /** =====================
   *  Guardar o actualizar técnico
   *  ===================== */
  formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    const tecnico = {
      nombre: inputs.nombre.value.trim(),
      apellido: inputs.apellido.value.trim(),
      telefono: inputs.telefono.value.trim(),
      duracionTurnoMinutos: inputs.duracion.value.trim(),
      puntosAcceso: [...chipsContainer.querySelectorAll("input[type='checkbox']:checked")].map(chk => chk.value)
    };

    if (!tecnico.nombre || !tecnico.apellido || !tecnico.telefono || !tecnico.duracionTurnoMinutos) {
      alert("Todos los campos son obligatorios");
      return;
    }

    if (indiceEdicion !== null) {
      tecnicos[indiceEdicion] = tecnico;
      indiceEdicion = null;
    } else {
      tecnicos.push(tecnico);
    }

    localStorage.setItem('tecnicos', JSON.stringify(tecnicos));
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
