export class Tecnico {
  constructor({
    id = null,
    nombre,
    apellido,
    telefono,
    duracionTurnoMinutos,
    email,
    imagen = null,
    imagenUrl = null,
    horarios = [],
    activo = true
  }) {
    this.id = id;
    this.nombre = nombre.trim();
    this.apellido = apellido.trim();
    this.telefono = telefono?.trim() || "";
    this.duracionTurnoMinutos = Number(duracionTurnoMinutos);
    this.email = email?.trim() || "";
    this.imagen = imagen;
    this.imagenUrl = imagenUrl;
    this.horarios = horarios;
    this.activo = activo;
  }
}