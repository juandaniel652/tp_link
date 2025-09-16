// archivo: clientesManager.js
export class ClienteManager {
  constructor(formId, tablaId) {
    /** =====================
     *  ELEMENTOS DOM
     *  ===================== */
    this.form = document.getElementById(formId);
    this.tablaBody = document.querySelector(`#${tablaId} tbody`);

    this.inputNumeroCliente = this.form.querySelector('#NumeroCliente');
    this.inputNombre = this.form.querySelector('#clienteNombre');
    this.inputApellido = this.form.querySelector('#clienteApellido');
    this.inputTelefono = this.form.querySelector('#clienteTelefono');
    this.inputDomicilio = this.form.querySelector('#clienteDomicilio');
    this.inputNumeroDomicilio = this.form.querySelector('#clienteNumeroDomicilio');

    /** =====================
     *  ESTADO
     *  ===================== */
    this.clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    this.indiceEdicion = null;

        /** =====================
     *  REGEX
     *  ===================== */
    // Quitamos la validación rígida de 10 dígitos
    this.regexSoloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    this.regexSoloNumeros = /^\d+$/;
    // Solo que empiece con 11 y tenga al menos 10 dígitos
    this.regexTelefono = /^11\d{0,8}$/;

    /** =====================
     *  MENSAJES Y CONTADORES
     *  ===================== */
    this.contadorTelefono = document.createElement('small');
    this.contadorTelefono.style.display = "block";
    this.contadorTelefono.style.marginTop = "4px";
    this.contadorTelefono.style.color = "#555";
    this.inputTelefono.insertAdjacentElement("afterend", this.contadorTelefono);

    this.mensajeValidacion = document.createElement('small');
    this.mensajeValidacion.style.display = "block";
    this.mensajeValidacion.style.marginTop = "8px";
    this.mensajeValidacion.style.color = "red";
    this.form.insertAdjacentElement("beforeend", this.mensajeValidacion);

    this.inicializarTelefono();
    this.agregarEventos();
    this.renderizarClientes();
  }

  /** =====================
   *  HELPERS
   *  ===================== */
  limpiarLetras(valor) {
    return valor.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
  }

  limpiarNumeros(valor) {
    return valor.replace(/\D/g, '');
  }

  limpiarCamposFormulario() {
    this.inputNumeroCliente.value = "";
    this.inputNombre.value = "";
    this.inputApellido.value = "";
    this.inputTelefono.value = "11";
    this.inputDomicilio.value = "";
    this.inputNumeroDomicilio.value = "";
    this.contadorTelefono.textContent = "0/8 dígitos";
    this.contadorTelefono.style.color = "orange";
    this.indiceEdicion = null;
    this.form.querySelector("button[type='submit']").textContent = "Guardar Cliente";
    this.mensajeValidacion.textContent = "";
  }

  inicializarTelefono() {
    this.inputTelefono.value = "11";
    this.contadorTelefono.textContent = "0/8 dígitos";
    this.contadorTelefono.style.color = "orange";
  }

  /** =====================
   *  VALIDACIONES
   *  ===================== */
  validarInputLetras(event) {
    event.target.value = this.limpiarLetras(event.target.value);
  }

  validarInputNumeros(event) {
    event.target.value = this.limpiarNumeros(event.target.value);
  }

  validarTelefonoEnInput(event) {
    let valor = this.limpiarNumeros(event.target.value);

    // Siempre debe empezar con "11"
    if (!valor.startsWith("11")) valor = "11" + valor;

    // No limitar en 10, que pueda escribir pero siempre limpiar
    event.target.value = valor;

    const restantes = Math.max(0, valor.length - 2);
    this.contadorTelefono.textContent = `${restantes}/8 dígitos`;
    this.contadorTelefono.style.color = restantes < 8 ? "orange" : "green";
  }


  validarCliente(cliente) {
    this.mensajeValidacion.textContent = "";

    if (!cliente.numeroCliente || !cliente.nombre || !cliente.apellido ||
        !cliente.telefono || !cliente.domicilio || !cliente.numeroDomicilio) {
      this.mensajeValidacion.textContent = 'Por favor, complete todos los campos.';
      return false;
    }

    if (!this.regexSoloNumeros.test(cliente.numeroCliente)) {
      this.mensajeValidacion.textContent = 'El número de cliente solo puede contener números.';
      return false;
    }

    if (!this.regexSoloLetras.test(cliente.nombre)) {
      this.mensajeValidacion.textContent = 'El nombre solo puede contener letras.';
      return false;
    }

    if (!this.regexSoloLetras.test(cliente.apellido)) {
      this.mensajeValidacion.textContent = 'El apellido solo puede contener letras.';
      return false;
    }

    if (cliente.telefono.length < 10 || !cliente.telefono.startsWith("11")) {
      this.mensajeValidacion.textContent = 'El teléfono debe comenzar con 11 y tener al menos 10 dígitos.';
      return false;
    }

    if (!this.regexSoloLetras.test(cliente.domicilio)) {
      this.mensajeValidacion.textContent = 'La calle solo puede contener letras.';
      return false;
    }

    if (!this.regexSoloNumeros.test(cliente.numeroDomicilio)) {
      this.mensajeValidacion.textContent = 'El número de domicilio solo puede contener números.';
      return false;
    }

    return true;
  }

  /** =====================
   *  RENDERIZAR TABLA
   *  ===================== */
  renderizarClientes() {
    this.tablaBody.innerHTML = '';

    if (this.clientes.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 6;
      td.className = "no-data";
      td.textContent = "No hay clientes registrados";
      tr.appendChild(td);
      this.tablaBody.appendChild(tr);
      return;
    }

    this.clientes.forEach((cliente, index) => {
      const tr = document.createElement('tr');

      tr.appendChild(this.crearTd(cliente.numeroCliente, "Número"));
      tr.appendChild(this.crearTd(cliente.nombre, "Nombre"));
      tr.appendChild(this.crearTd(cliente.apellido, "Apellido"));
      tr.appendChild(this.crearTd(cliente.telefono, "Teléfono"));
      tr.appendChild(this.crearTd(`${cliente.domicilio} ${cliente.numeroDomicilio}`, "Domicilio"));

      const tdAcciones = document.createElement('td');
      tdAcciones.dataset.label = "Acciones";

      const btnEditar = document.createElement('button');
      btnEditar.className = "btn-action edit";
      btnEditar.dataset.index = index;
      btnEditar.textContent = "✏️";

      const btnEliminar = document.createElement('button');
      btnEliminar.className = "btn-action delete";
      btnEliminar.dataset.index = index;
      btnEliminar.textContent = "🗑️";

      tdAcciones.appendChild(btnEditar);
      tdAcciones.appendChild(btnEliminar);

      tr.appendChild(tdAcciones);
      this.tablaBody.appendChild(tr);
    });
  }

  crearTd(contenido, label) {
    const td = document.createElement('td');
    td.dataset.label = label;
    td.textContent = contenido;
    return td;
  }

  /** =====================
   *  EVENTOS
   *  ===================== */
  agregarEventos() {
    this.inputNumeroCliente.addEventListener('input', (e) => this.validarInputNumeros(e));
    this.inputNombre.addEventListener('input', (e) => this.validarInputLetras(e));
    this.inputApellido.addEventListener('input', (e) => this.validarInputLetras(e));
    this.inputDomicilio.addEventListener('input', (e) => this.validarInputLetras(e));
    this.inputNumeroDomicilio.addEventListener('input', (e) => this.validarInputNumeros(e));
    this.inputTelefono.addEventListener('input', (e) => this.validarTelefonoEnInput(e));

    this.form.addEventListener('submit', (e) => this.guardarCliente(e));

    this.tablaBody.addEventListener('click', (e) => this.handleTablaClick(e));
  }

  guardarCliente(e) {
    e.preventDefault();
    const cliente = {
      numeroCliente: this.inputNumeroCliente.value.trim(),
      nombre: this.inputNombre.value.trim(),
      apellido: this.inputApellido.value.trim(),
      telefono: this.inputTelefono.value.trim(),
      domicilio: this.inputDomicilio.value.trim(),
      numeroDomicilio: this.inputNumeroDomicilio.value.trim()
    };

    if (!this.validarCliente(cliente)) return;

    if (this.indiceEdicion !== null) {
      this.clientes[this.indiceEdicion] = cliente;
      this.indiceEdicion = null;
    } else {
      this.clientes.push(cliente);
    }

    localStorage.setItem('clientes', JSON.stringify(this.clientes));
    this.limpiarCamposFormulario();
    this.renderizarClientes();
  }

  handleTablaClick(e) {
    const target = e.target;
    const index = target.dataset.index;

    if (!index) return;

    if (target.classList.contains("edit")) {
      const cliente = this.clientes[index];
      this.inputNumeroCliente.value = cliente.numeroCliente;
      this.inputNombre.value = cliente.nombre;
      this.inputApellido.value = cliente.apellido;
      this.inputTelefono.value = cliente.telefono;
      this.inputDomicilio.value = cliente.domicilio;
      this.inputNumeroDomicilio.value = cliente.numeroDomicilio;
      this.form.querySelector("button[type='submit']").textContent = "Guardar Cambios";
      this.indiceEdicion = index;
      this.form.scrollIntoView({ behavior: "smooth" });
    }

    if (target.classList.contains("delete")) {
      const cliente = this.clientes[index];
      if (confirm(`¿Seguro que quieres eliminar al cliente ${cliente.nombre} ${cliente.apellido}?`)) {
        this.clientes.splice(index, 1);
        localStorage.setItem("clientes", JSON.stringify(this.clientes));
        this.renderizarClientes();
      }
    }
  }
}
