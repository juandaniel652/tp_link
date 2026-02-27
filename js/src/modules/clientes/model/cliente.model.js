export class Cliente {
  constructor({
    id = null,
    numeroCliente,
    nombre,
    apellido,
    telefono,
    domicilio,
    numeroDomicilio,
    email
  }) {
    this.id = id;
    this.numeroCliente = numeroCliente.trim();
    this.nombre = nombre.trim();
    this.apellido = apellido.trim();
    this.telefono = telefono.trim();
    this.domicilio = domicilio.trim();
    this.numeroDomicilio = numeroDomicilio;
    this.email = email.trim();
  }
}