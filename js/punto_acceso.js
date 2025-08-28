// =============================
//  punto_acceso.js con localStorage
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formTecnico");
  const numeroNapInput = document.getElementById("numeroNap");
  const puntoContainer = document.getElementById("puntoContainer");

  // Cargar puntos guardados desde localStorage (si existen)
  let puntos = JSON.parse(localStorage.getItem("puntosAcceso")) || [];

  // Validar número de NAP
  const validarNumeroNap = (valor) => {
    const numero = parseInt(valor, 10);

    if (isNaN(numero)) {
      alert("Por favor ingrese un número válido.");
      return false;
    }
    if (numero <= 0) {
      alert("El número de punto de acceso debe ser mayor a 0.");
      return false;
    }
    if (numero > 999) {
      alert("El número de punto de acceso no puede tener más de 3 dígitos (máximo 999).");
      return false;
    }
    return true;
  };

  // Guardar en localStorage
  const guardarEnLocalStorage = () => {
    localStorage.setItem("puntosAcceso", JSON.stringify(puntos));
  };

  // Renderizar tarjetas
  const renderPuntos = () => {
    puntoContainer.innerHTML = ""; // Limpia antes de volver a mostrar
    puntos.forEach((punto, index) => {
      const card = document.createElement("div");
      card.classList.add("punto-card");

      card.innerHTML = `
        <h3>NAP ${index + 1}</h3>
        <p>Número de punto de acceso: <strong>${punto}</strong></p>
      `;

      puntoContainer.appendChild(card);
    });
  };

  // Manejo de envío del formulario
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const valor = numeroNapInput.value.trim();

    if (!validarNumeroNap(valor)) return;

    // Guardar en la lista
    puntos.push(valor);

    // Persistir
    guardarEnLocalStorage();

    // Renderizar
    renderPuntos();

    // Limpiar input
    numeroNapInput.value = "";
  });

  // Al cargar la página, mostrar lo guardado
  renderPuntos();
});
