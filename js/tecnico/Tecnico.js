export default class Tecnico {
  constructor({ nombre, apellido, telefono, duracionTurnoMinutos, horarios = [] }) {
    this.nombre = nombre.trim();
    this.apellido = apellido.trim();
    this.telefono = telefono.trim();
    this.duracionTurnoMinutos = parseInt(duracionTurnoMinutos, 10);

    // Normalizar días a minúscula
    this.horarios = Array.isArray(horarios) ? horarios.map(h => ({
      dia: h.dia.toLowerCase(), // 🔹 normalizamos aquí
      inicio: h.inicio,
      fin: h.fin
    })) : [];
  }

  // ======================
  // VALIDACIONES
  // ======================
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

  // ======================
  // LÓGICA DE HORARIOS
  // ======================

  // Genera los bloques de horarios para cada día configurado
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

  // Devuelve solo los días disponibles (ya normalizados en minúscula)
  getDiasDisponibles() {
    console.log("👉 Horarios del técnico:", this.horarios);
    return this.horarios.map(h => h.dia);
  }
}
