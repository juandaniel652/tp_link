document.addEventListener('DOMContentLoaded', () => {
  /** =====================
   *  Constantes y Estado
   *  ===================== */
  const form = document.getElementById('formCliente');
  const tablaBody = document.querySelector('#clientesTable tbody');

  const inputNumeroCliente = document.getElementById('NumeroCliente');
  const inputNombre = document.getElementById('clienteNombre');
  const inputApellido = document.getElementById('clienteApellido');
  const inputTelefono = document.getElementById('clienteTelefono');
  const inputDomicilio = document.getElementById('clienteDomicilio');
  const inputNumeroDomicilio = document.getElementById('clienteNumeroDomicilio');

  const clientes = JSON.parse(localStorage.getItem('clientes')) || [];

  /** =====================
   *  Regex
   *  ===================== */
  const regexSoloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
  const regexSoloNumeros = /^\d+$/;
  const regexTelefono = /^11\d{8}$/;

  /** =====================
   *  Helpers de limpieza
   *  ===================== */
  const limpiarLetras = (valor) => valor.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
  const limpiarNumeros = (valor) => valor.replace(/\D/g, '');

  function limpiarCamposFormulario() {
    inputNumeroCliente.value = "";
    inputNombre.value = "";
    inputApellido.value = "";
    inputDomicilio.value = "";
    inputNumeroDomicilio.value = "";

    inputTelefono.value = "11";
    contadorTelefono.textContent = "0/8 dígitos";
    contadorTelefono.style.color = "orange";
  }

  /** =====================
   *  Contadores y mensajes visuales
   *  ===================== */
  const contadorTelefono = document.createElement('small');
  contadorTelefono.style.display = "block";
  contadorTelefono.style.marginTop = "4px";
  contadorTelefono.style.color = "#555";
  inputTelefono.insertAdjacentElement("afterend", contadorTelefono);

  const mensajeValidacion = document.createElement('small');
  mensajeValidacion.style.display = "block";
  mensajeValidacion.style.marginTop = "8px";
  mensajeValidacion.style.color = "red";
  form.insertAdjacentElement("beforeend", mensajeValidacion);

  /** =====================
   *  Validadores Input
   *  ===================== */
  function validarInputLetras(event) {
    event.target.value = limpiarLetras(event.target.value);
  }

  function validarInputNumeros(event) {
    event.target.value = limpiarNumeros(event.target.value);
  }

  function validarTelefonoEnInput(event) {
    let valor = limpiarNumeros(event.target.value);

    if (!valor.startsWith("11")) valor = "11" + valor;
    valor = valor.slice(0, 10);

    event.target.value = valor;

    const restantes = Math.max(0, valor.length - 2);
    contadorTelefono.textContent = `${restantes}/8 dígitos`;
    contadorTelefono.style.color = restantes < 8 ? "orange" : "green";
  }

  /** =====================
   *  Validación en Submit
   *  ===================== */
  function validarCliente(cliente) {
    mensajeValidacion.textContent = "";

    if (!cliente.numeroCliente || !cliente.nombre || !cliente.apellido ||
        !cliente.telefono || !cliente.domicilio || !cliente.numeroDomicilio) {
      mensajeValidacion.textContent = 'Por favor, complete todos los campos.';
      return false;
    }

    if (!regexSoloNumeros.test(cliente.numeroCliente)) {
      mensajeValidacion.textContent = 'El número de cliente solo puede contener números.';
      return false;
    }

    if (!regexSoloLetras.test(cliente.nombre)) {
      mensajeValidacion.textContent = 'El nombre solo puede contener letras.';
      return false;
    }

    if (!regexSoloLetras.test(cliente.apellido)) {
      mensajeValidacion.textContent = 'El apellido solo puede contener letras.';
      return false;
    }

    if (!regexTelefono.test(cliente.telefono)) {
      mensajeValidacion.textContent = 'El teléfono debe comenzar con 11 y tener exactamente 10 dígitos.';
      return false;
    }

    if (!regexSoloLetras.test(cliente.domicilio)) {
      mensajeValidacion.textContent = 'El domicilio solo puede contener letras.';
      return false;
    }

    if (!regexSoloNumeros.test(cliente.numeroDomicilio)) {
      mensajeValidacion.textContent = 'El número de domicilio solo puede contener números.';
      return false;
    }

    return true;
  }

  /** =====================
   *  Render en Tabla
   *  ===================== */
  function renderizarClientes() {
    tablaBody.innerHTML = '';
    clientes.forEach(cliente => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${cliente.numeroCliente}</td>
        <td>${cliente.nombre}</td>
        <td>${cliente.apellido}</td>
        <td>${cliente.telefono}</td>
        <td>${cliente.domicilio} ${cliente.numeroDomicilio}</td>
      `;
      tablaBody.appendChild(fila);
    });
  }

  /** =====================
   *  Eventos
   *  ===================== */
  inputNumeroCliente.addEventListener('input', validarInputNumeros);
  inputNombre.addEventListener('input', validarInputLetras);
  inputApellido.addEventListener('input', validarInputLetras);
  inputDomicilio.addEventListener('input', validarInputLetras);
  inputNumeroDomicilio.addEventListener('input', validarInputNumeros);
  inputTelefono.addEventListener('input', validarTelefonoEnInput);

  // Inicializar teléfono
  inputTelefono.value = "11";
  contadorTelefono.textContent = "0/8 dígitos";
  contadorTelefono.style.color = "orange";

  // Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const cliente = {
      numeroCliente: inputNumeroCliente.value.trim(),
      nombre: inputNombre.value.trim(),
      apellido: inputApellido.value.trim(),
      telefono: inputTelefono.value.trim(),
      domicilio: inputDomicilio.value.trim(),
      numeroDomicilio: inputNumeroDomicilio.value.trim()
    };

    if (!validarCliente(cliente)) return;

    clientes.push(cliente);
    localStorage.setItem('clientes', JSON.stringify(clientes));

    limpiarCamposFormulario();
    renderizarClientes();
  });

  /** =====================
   *  Render Inicial
   *  ===================== */
  renderizarClientes();
});
