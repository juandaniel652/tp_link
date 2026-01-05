// archivo: clientesModule.js
import { ClienteController } from './clienteController.js';

export class ClienteManager {
  constructor(formId, tablaId) {
    // Controller (único que maneja submit y backend)
    this.controller = new ClienteController(formId, tablaId);

    // Referencias útiles
    this.form = this.controller.form;
    this.inputs = this.controller.inputs;

    // ===============================
    // Contador dinámico de teléfono
    // ===============================
    this.contadorTelefono = document.createElement('small');
    Object.assign(this.contadorTelefono.style, {
      display: 'block',
      marginTop: '4px',
      color: 'orange'
    });

    this.inputs.telefono.insertAdjacentElement(
      'afterend',
      this.contadorTelefono
    );

    // Inicialización UI
    this.inicializarTelefono();
    this.agregarEventosUI();
  }

  // ===============================
  // INIT
  // ===============================
  inicializarTelefono() {
    this.inputs.telefono.value = '11';
    this.contadorTelefono.textContent = '0/8 dígitos';
  }

  // ===============================
  // EVENTOS SOLO UI (NO submit)
  // ===============================
  agregarEventosUI() {
    this.inputs.numeroCliente.addEventListener('input', e =>
      this.limpiarNumeros(e)
    );

    this.inputs.nombre.addEventListener('input', e =>
      this.limpiarLetras(e)
    );

    this.inputs.apellido.addEventListener('input', e =>
      this.limpiarLetras(e)
    );

    this.inputs.domicilio.addEventListener('input', e =>
      this.limpiarLetras(e)
    );

    this.inputs.telefono.addEventListener('input', e =>
      this.formatearTelefono(e)
    );
  }

  // ===============================
  // HELPERS UI
  // ===============================
  limpiarLetras(e) {
    e.target.value = e.target.value.replace(
      /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g,
      ''
    );
  }

  limpiarNumeros(e) {
    e.target.value = e.target.value.replace(/\D/g, '');
  }

  formatearTelefono(e) {
    let valor = e.target.value.replace(/\D/g, '');

    if (!valor.startsWith('11')) {
      valor = '11' + valor;
    }

    valor = valor.slice(0, 10);
    e.target.value = valor;

    const escritos = Math.max(0, valor.length - 2);
    this.contadorTelefono.textContent = `${escritos}/8 dígitos`;
    this.contadorTelefono.style.color =
      escritos < 8 ? 'orange' : 'green';
  }
}
