// archivo: cliente/cliente.js
export class Cliente {
  constructor(numeroCliente, nombre, apellido, telefono, domicilio, numeroDomicilio, email) {
    this.numeroCliente = numeroCliente.trim();
    this.nombre = nombre.trim();
    this.apellido = apellido.trim();
    this.telefono = telefono.trim();
    this.domicilio = domicilio.trim();
    this.numeroDomicilio = numeroDomicilio.trim();
    this.email = email.trim();
  }
}
