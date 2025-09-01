document.addEventListener('DOMContentLoaded', () => {
  /** =====================
   *  Constantes y Estado
   *  ===================== */
  const formulario = document.getElementById('formTecnico');
  const contenedor = document.getElementById('tecnicosContainer');
  const chipsContainer = document.getElementById('puntoAcceso');

  let tecnicos = JSON.parse(localStorage.getItem('tecnicos')) || [];
  let indiceEdicion = null; // null = modo agregar, número = índice a editar

  const inputs = {
    nombre: document.getElementById('tecnicoNombre'),
    apellido: document.getElementById('tecnicoApellido'),
    telefono: document.getElementById('tecnicoTelefono'),
    duracion: document.getElementById('duracionTurnoMinutos'),
    punto: chipsContainer
  };

  /** =====================
   *  Cargar puntos de acceso (NAPs)
   *  ===================== */
  function cargarPuntosAcceso() {
    const puntos = JSON.parse(localStorage.getItem("puntosAcceso")) || [];
    chipsContainer.innerHTML = ``;

    puntos.forEach(puntoObj => {
      const label = document.createElement("label");
      label.classList.add("chip");

      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = puntoObj.numero;

      const span = document.createElement("span");
      span.textContent = `NAP ${puntoObj.numero}`;

      label.appendChild(input);
      label.appendChild(span);
      chipsContainer.appendChild(label);
    });
  }

  /** =====================
   *  Limpieza formulario
   *  ===================== */
  function limpiarCamposFormulario() {
    inputs.nombre.value = "";
    inputs.apellido.value = "";
    inputs.duracion.value = "";
    inputs.telefono.value = "";
    [...chipsContainer.querySelectorAll("input[type='checkbox']")].forEach(chk => chk.checked = false);
    indiceEdicion = null;
    formulario.querySelector("button[type='submit']").textContent = "Agregar Técnico";
  }

  /** =====================
   *  Renderización
   *  ===================== */
  const render = () => {
    contenedor.innerHTML = '';
    tecnicos.forEach((t, index) => {
      const card = document.createElement('div');
      card.classList.add('tecnico-card');

      const naps = Array.isArray(t.puntosAcceso) ? t.puntosAcceso.join(', ') : '';

      card.innerHTML = `
        <h3>${t.nombre} ${t.apellido}</h3>
        <p><strong>Teléfono:</strong> ${t.telefono}</p>
        <p><strong>Duración Turno:</strong> ${t.duracionTurnoMinutos} minutos</p>
        <p><strong>Puntos de Acceso:</strong> NAP ${naps}</p>
        <div class="acciones">
          <button class="btn-chip editar">✏️ Editar</button>
          <button class="btn-chip eliminar">🗑️ Eliminar</button>
        </div>
      `;

      // Evento eliminar
      card.querySelector(".eliminar").addEventListener("click", () => {
        if (confirm("¿Seguro que quieres eliminar este técnico?")) {
          tecnicos.splice(index, 1);
          localStorage.setItem("tecnicos", JSON.stringify(tecnicos));
          render();
        }
      });

      // Evento editar
      card.querySelector(".editar").addEventListener("click", () => {
        indiceEdicion = index;
        const tecnico = tecnicos[index];

        inputs.nombre.value = tecnico.nombre;
        inputs.apellido.value = tecnico.apellido;
        inputs.telefono.value = tecnico.telefono;
        inputs.duracion.value = tecnico.duracionTurnoMinutos;

        // Cargar puntos seleccionados
        [...chipsContainer.querySelectorAll("input[type='checkbox']")].forEach(chk => {
          chk.checked = tecnico.puntosAcceso.includes(parseInt(chk.value));
        });

        formulario.querySelector("button[type='submit']").textContent = "Guardar Cambios";

        // Subir automáticamente al formulario
        formulario.scrollIntoView({ behavior: "smooth" });
      });

      contenedor.appendChild(card);
    });
  };

  /** =====================
   *  Submit
   *  ===================== */
  formulario.addEventListener('submit', (e) => {
    e.preventDefault();

    const tecnico = {
      nombre: inputs.nombre.value.trim(),
      apellido: inputs.apellido.value.trim(),
      telefono: inputs.telefono.value,
      duracionTurnoMinutos: inputs.duracion.value.trim(),
      puntosAcceso: [...chipsContainer.querySelectorAll("input[type='checkbox']:checked")].map(chk => parseInt(chk.value))
    };

    if (indiceEdicion !== null) {
      // Editar técnico existente
      tecnicos[indiceEdicion] = tecnico;
      indiceEdicion = null;
    } else {
      // Agregar nuevo técnico
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
