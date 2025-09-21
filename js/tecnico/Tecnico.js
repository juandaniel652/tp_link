export default class Tecnico {
  constructor({ nombre, apellido, telefono, duracionTurnoMinutos, horarios = [] }) {
    this.nombre = nombre.trim();
    this.apellido = apellido.trim();
    this.telefono = telefono.trim();
    this.duracionTurnoMinutos = duracionTurnoMinutos.trim();
    this.horarios = Array.isArray(horarios) ? horarios : [];
  }

  static validarCampo(campo, valor) {
    const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    const telRegex = /^([0-9]{2})\s([0-9]{4})-([0-9]{4})$/;
    const duracion = Number(valor);

    switch (campo) {
      case "nombre":
      case "apellido":
        return valor && soloLetras.test(valor) ? "" : "Solo se permiten letras (sin números).";
      case "telefono":
        return telRegex.test(valor) ? "" : "Formato válido: 11 1234-5678";
      case "duracionTurnoMinutos":
        if (isNaN(duracion) || duracion <= 0) return "Debe ser un número mayor que 0.";
        if (duracion > 90) return "Máximo permitido es 90 minutos.";
        if (duracion % 5 !== 0) return "Debe ser múltiplo de 5.";
        return "";
      default:
        return "";
    }
  }

  static validar(tecnico) {
    return (
      !this.validarCampo("nombre", tecnico.nombre) &&
      !this.validarCampo("apellido", tecnico.apellido) &&
      !this.validarCampo("telefono", tecnico.telefono) &&
      !this.validarCampo("duracionTurnoMinutos", tecnico.duracionTurnoMinutos)
    );
  }
}
