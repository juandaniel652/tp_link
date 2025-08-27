document.addEventListener('DOMContentLoaded', () => {
  /** =====================
   *  Constantes y Estado
   *  ===================== */
  const formulario = document.getElementById('formTecnico');
  const contenedor = document.getElementById('tecnicosContainer');

  let tecnicos = JSON.parse(localStorage.getItem('tecnicos')) || [];

  const inputs = {
    nombre: document.getElementById('tecnicoNombre'),
    apellido: document.getElementById('tecnicoApellido'),
    telefono: document.getElementById('tecnicoTelefono'),
    duracion: document.getElementById('duracionTurnoMinutos'),
    punto: document.getElementById('puntoAcceso')
  };

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
    if (!numeros.startsWith('11')) numeros = '11';
    numeros = numeros.slice(0, 10);
    const p1 = numeros.slice(0, 2);
    const p2 = numeros.slice(2, 6);
    const p3 = numeros.slice(6, 10);
    return p3 ? `${p1}-${p2}-${p3}` : p2 ? `${p1}-${p2}` : p1;
  };

  const validarTexto = valor => /^[a-zA-Z]+$/.test(valor.trim());
  const validarTelefono = valor => /^11\d{8}$/.test(valor.replace(/\D/g, ''));
  const validarDuracion = valor => {
    const num = Number(valor);
    return num > 0 && num % 5 === 0;
  };
  const validarPunto = valor => /^\d{1,2}$/.test(valor.trim());

  /** =====================
   *  Limpieza controlada del formulario
   *  ===================== */
  function limpiarCamposFormulario() {
    inputs.nombre.value = "";
    inputs.apellido.value = "";
    inputs.duracion.value = "";
    inputs.punto.value = "";

    // Teléfono siempre se reinicia en "11"
    inputs.telefono.value = "11";
    validarCampo(inputs.telefono);
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

  inputs.punto.addEventListener('input', () => {
    inputs.punto.value = inputs.punto.value.replace(/[^0-9]/g, '').slice(0, 2);
    validarCampo(inputs.punto);
  });

  inputs.telefono.addEventListener('input', () => {
    let raw = inputs.telefono.value.replace(/\D/g, '');
    if (!raw.startsWith('11')) raw = '11';
    raw = raw.slice(0, 10);
    inputs.telefono.value = formatearTelefono(raw);
    validarCampo(inputs.telefono);
  });

  /** =====================
   *  Validación individual de campos
   *  ===================== */
  const validarCampo = (input) => {
    const key = Object.keys(inputs).find(k => inputs[k] === input);
    const valor = input.value.trim();
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
        valido = validarPunto(valor);
        mensaje = valido ? '' : 'Entre 1 y 2 dígitos';
        break;
      case 'telefono':
        const raw = valor.replace(/\D/g, '');
        valido = validarTelefono(valor);
        mensaje = valido ? '' : `Faltan ${Math.max(0, 10 - raw.length)} dígitos`;
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
      card.style.border = "1px solid #ccc";
      card.style.padding = "10px";
      card.style.marginBottom = "8px";
      card.style.borderRadius = "5px";
      card.style.backgroundColor = "#f9f9f9";
      card.innerHTML = `
        <h3>Nombre: ${t.nombre}</h3>
        <h3>Apellido: ${t.apellido}</h3>
        <h3>Teléfono: ${t.telefono}</h3>
        <h3>Duración Turno: ${t.duracionTurnoMinutos} minutos</h3>
        <h3>Punto de Acceso: ${t.puntoAcceso}</h3>
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
      puntoAcceso: inputs.punto.value.trim()
    };

    // Validar todos los campos antes de enviar
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

    // 🔥 limpieza controlada
    limpiarCamposFormulario();

    render();
  });

  /** =====================
   *  Render inicial
   *  ===================== */
  limpiarCamposFormulario();
  render();
});
