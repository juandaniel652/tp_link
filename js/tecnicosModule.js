document.addEventListener('DOMContentLoaded', () => {
  /** =====================
   *  Constantes y Estado
   *  ===================== */
  const formulario = document.getElementById('formTecnico');
  const contenedor = document.getElementById('tecnicosContainer');
  const chipsContainer = document.getElementById('puntoAcceso'); // contenedor de chips

  let tecnicos = JSON.parse(localStorage.getItem('tecnicos')) || [];

  const inputs = {
    nombre: document.getElementById('tecnicoNombre'),
    apellido: document.getElementById('tecnicoApellido'),
    telefono: document.getElementById('tecnicoTelefono'),
    duracion: document.getElementById('duracionTurnoMinutos'),
    punto: chipsContainer
  };

  /** =====================
   *  Cargar puntos de acceso (NAPs) como chips
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
   *  Mensajes y estilos
   *  ===================== */
  const mensajes = {};
  Object.keys(inputs).forEach(key => {
    const span = document.createElement('span');
    span.style.display = 'block';
    span.style.marginTop = '4px';
    span.style.fontSize = '0.9em';
    span.style.color = 'red';
    inputs[key].parentNode.insertBefore(span, inputs[key].nextSibling);
    mensajes[key] = span;
  });

  /** =====================
   *  Funciones de formato y validación
   *  ===================== */
  const formatearTelefono = valor => {
    let numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 2) return numeros;
    const p1 = numeros.slice(0, 2);
    const p2 = numeros.slice(2, 6);
    const p3 = numeros.slice(6, 10);
    const p4 = numeros.slice(10);
    let resultado = `${p1}-${p2}-${p3}`;
    if (p4) resultado += `-${p4}`;
    return resultado;
  };

  const validarTexto = valor => /^[a-zA-Z]+$/.test(valor.trim());
  const validarTelefono = valor => {
    const raw = valor.replace(/\D/g, '');
    return raw.length >= 10; // al menos 10 dígitos
  };
  const validarDuracion = valor => {
    const num = Number(valor);
    return num > 0 && num % 5 === 0;
  };
  const validarPunto = () => {
    const seleccionados = [...chipsContainer.querySelectorAll("input[type='checkbox']:checked")];
    return seleccionados.length > 0;
  };

  /** =====================
   *  Limpieza controlada del formulario
   *  ===================== */
  function limpiarCamposFormulario() {
    inputs.nombre.value = "";
    inputs.apellido.value = "";
    inputs.duracion.value = "";
    inputs.telefono.value = "";
    [...chipsContainer.querySelectorAll("input[type='checkbox']")].forEach(chk => chk.checked = false);
  }

  /** =====================
   *  Manejo de Inputs
   *  ===================== */
  inputs.nombre.addEventListener('input', () => {
    inputs.nombre.value = inputs.nombre.value.replace(/[^a-zA-Z]/g, '');
    validarCampo(inputs.nombre);
  });

  inputs.apellido.addEventListener('input', () => {
    inputs.apellido.value = inputs.apellido.value.replace(/[^a-zA-Z]/g, '');
    validarCampo(inputs.apellido);
  });

  inputs.duracion.addEventListener('input', () => {
    inputs.duracion.value = inputs.duracion.value.replace(/[^0-9]/g, '');
    validarCampo(inputs.duracion);
  });

  chipsContainer.addEventListener('change', () => {
    validarCampo(inputs.punto);
  });

  inputs.telefono.addEventListener('input', () => {
    let raw = inputs.telefono.value.replace(/\D/g, '');
    if (raw.length > 12) raw = raw.slice(0, 12); // máximo 12 dígitos
    inputs.telefono.value = formatearTelefono(raw);
    validarCampo(inputs.telefono);
  });

  /** =====================
   *  Validación individual
   *  ===================== */
  const validarCampo = (input) => {
    const key = Object.keys(inputs).find(k => inputs[k] === input);
    const valor = input.value ? input.value.trim() : "";
    let valido = true;
    let mensaje = '';

    switch(key) {
      case 'nombre':
      case 'apellido':
        valido = validarTexto(valor);
        mensaje = valido ? '' : 'Solo letras';
        break;
      case 'duracion':
        valido = validarDuracion(valor);
        mensaje = valido ? '' : 'Múltiplo de 5';
        break;
      case 'punto':
        valido = validarPunto();
        mensaje = valido ? '' : 'Seleccione al menos un NAP';
        break;
      case 'telefono':
        valido = validarTelefono(valor);
        mensaje = valido ? '' : 'Número incompleto';
        break;
    }

    mensajes[key].textContent = mensaje;
    mensajes[key].style.color = valido ? 'green' : 'red';
    return valido;
  };

  /** =====================
   *  Renderización
   *  ===================== */
  const render = () => {
    contenedor.innerHTML = '';
    tecnicos.forEach(t => {
      const card = document.createElement('div');
      card.classList.add('tecnico-card');

      const naps = Array.isArray(t.puntosAcceso) ? t.puntosAcceso.join(', ') : '';

      card.innerHTML = `
        <h3>Nombre: ${t.nombre}</h3>
        <h3>Apellido: ${t.apellido}</h3>
        <h3>Teléfono: ${t.telefono}</h3>
        <h3>Duración Turno: ${t.duracionTurnoMinutos} minutos</h3>
        <h3>Puntos de Acceso: NAP ${naps}</h3>
      `;
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

    let formularioValido = true;
    Object.values(inputs).forEach(input => {
      if(!validarCampo(input)) formularioValido = false;
    });

    if(!formularioValido) {
      alert('Corrige los campos en rojo antes de enviar');
      return;
    }

    tecnicos.push(tecnico);
    localStorage.setItem('tecnicos', JSON.stringify(tecnicos));

    limpiarCamposFormulario();
    render();
  });

  /** =====================
   *  Render inicial
   *  ===================== */
  cargarPuntosAcceso();  
  limpiarCamposFormulario();
  render();
});
