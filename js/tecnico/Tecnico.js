export default class Tecnico {

  constructor(data) {

    console.log("DATA RAW:", data);
    
    this.id = data.id;
    
    this.nombre = data.nombre?.trim() || "";
    this.apellido = data.apellido?.trim() || "";
    this.telefono = data.telefono?.trim() || "";
    
    this.duracionTurnoMinutos = parseInt(
      data.duracionTurnoMinutos ??
      data.duracion_turno_minutos ??
      data.duracion_turno_min,
      10
    );
  
    this.imagen = data.imagen ?? data.imagen_url ?? "";
  
    this.email = data.email?.trim() || "";
  
    this.horarios = Array.isArray(data.horarios)
      ? data.horarios.map(h => ({
          dia: (h.dia ?? h.dia_semana)?.toString().toLowerCase(),
          inicio: (h.inicio ?? h.hora_inicio)?.slice(0,5),
          fin: (h.fin ?? h.hora_fin)?.slice(0,5)
        }))
      : [];
      
      console.log("duracion:", this.duracionTurnoMinutos);
      console.log("horarios:", this.horarios);
      
      
      this.horarios = Array.isArray(horarios)
        ? horarios
            .filter(h => h && (h.dia || h.dia_semana))
            .map(h => ({
              dia: (h.dia ?? h.dia_semana).toString().toLowerCase(),
              inicio: (h.inicio ?? h.hora_inicio).slice(0,5),
              fin: (h.fin ?? h.hora_fin).slice(0,5)
            }))
        : [];
          
  }

  getDiasDisponibles() {
    return this.horarios.map(h => h.dia);
  }



  // ======================
  // VALIDACIONES
  // ======================
  static validarCampo(campo, valor) {
    const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    const telRegex = /^([0-9]{2})\s([0-9]{4})-([0-9]{4})$/;
    const duracion = Number(valor);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Validación básica de email

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
      case "email":
        return emailRegex.test(valor) ? "" : "Email inválido";
      default:
        return "";
    }
  }

  static validar(tecnico) {
    return (
      !this.validarCampo("nombre", tecnico.nombre) &&
      !this.validarCampo("apellido", tecnico.apellido) &&
      !this.validarCampo("telefono", tecnico.telefono) &&
      !this.validarCampo("duracionTurnoMinutos", tecnico.duracionTurnoMinutos) &&
      !this.validarCampo("email", tecnico.email)
    );
  }

  // ======================
  // LÓGICA DE HORARIOS
  // ======================

  generarBloques() {
    const bloquesPorDia = {};

    this.horarios.forEach(({ dia, inicio, fin }) => {
      const bloques = [];
      let [h, m] = inicio.split(":").map(Number);
      const [hFin, mFin] = fin.split(":").map(Number);

      while (h < hFin || (h === hFin && m < mFin)) {
        const horaStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        bloques.push(horaStr);

        m += this.duracionTurnoMinutos;
        if (m >= 60) {
          h += Math.floor(m / 60);
          m = m % 60;
        }
      }

      bloquesPorDia[dia] = bloques;
    });

    return bloquesPorDia;
  }

  getDiasDisponibles() {
    return this.horarios.map(h => h.dia);
  }
}
