// archivo: cliente/validadorClientes.js
export class ValidadorClientes {
  constructor(mensajeElemento) {
    this.mensajeElemento = mensajeElemento;

    // Expresiones regulares
    this.regexSoloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    this.regexSoloNumeros = /^\d+$/;
    this.regexTelefono = /^11\d{8}$/;
    this.regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  }

  mostrarError(mensaje) {
    this.mensajeElemento.textContent = mensaje;
    return false;
  }

  limpiarMensaje() {
    this.mensajeElemento.textContent = "";
  }

  validar(cliente) {
    this.limpiarMensaje();

    if ( !cliente.numeroCliente?.trim() || !cliente.nombre?.trim() || !cliente.apellido?.trim() || 
    !cliente.telefono?.trim() || !cliente.domicilio?.trim() || !cliente.numeroDomicilio?.trim() 
    || !cliente.email?.trim()) 
    
    {
      return this.mostrarError('Por favor, complete todos los campos.');
    }

    if (!this.regexSoloNumeros.test(cliente.numeroCliente)) {
      return this.mostrarError('El número de cliente solo puede contener números.');
    }

    if (!this.regexSoloLetras.test(cliente.nombre)) {
      return this.mostrarError('El nombre solo puede contener letras.');
    }

    if (!this.regexSoloLetras.test(cliente.apellido)) {
      return this.mostrarError('El apellido solo puede contener letras.');
    }

    if (!this.regexTelefono.test(cliente.telefono)) {
      return this.mostrarError('El teléfono debe comenzar con 11 y tener exactamente 10 dígitos.');
    }

    if (!this.regexSoloLetras.test(cliente.domicilio)) {
      return this.mostrarError('La calle solo puede contener letras.');
    }

    if (!this.regexSoloNumeros.test(cliente.numeroDomicilio)) {
      return this.mostrarError('El número de domicilio solo puede contener números.');
    }

    if (!this.regexEmail.test(cliente.email)) {
      return this.mostrarError('El email no es válido.');
    }

    return true;
  }
}
