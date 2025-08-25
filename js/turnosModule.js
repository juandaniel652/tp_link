document.addEventListener("DOMContentLoaded", () => {
  const formTurno = document.getElementById("formTurno");
  const fechaInput = document.getElementById("turnoFecha");
  const selectHora = document.getElementById("turnoHora");
  const selectCliente = document.getElementById("selectCliente");
  const selectTecnico = document.getElementById("selectTecnico");
  const turnosContainer = document.getElementById("turnosContainer");

  // =========================
  // Cargar clientes desde localStorage
  // =========================
  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  clientes.forEach(c => {
    const option = document.createElement("option");
    option.value = `${c.numeroCliente} - ${c.nombre} ${c.apellido}`;
    option.textContent = `${c.numeroCliente} - ${c.nombre} ${c.apellido}`;
    selectCliente.appendChild(option);
  });

  // =========================
  // Cargar técnicos desde localStorage
  // =========================
  const tecnicos = JSON.parse(localStorage.getItem("tecnicos")) || [];
  tecnicos.forEach(t => {
    const option = document.createElement("option");
    option.value = t.nombre;
    option.textContent = `${t.nombre}${t.especialidad ? " (" + t.especialidad + ")" : ""}`;
    selectTecnico.appendChild(option);
  });

  // =========================
  // Configuración Fecha
  // =========================
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  fechaInput.min = `${yyyy}-${mm}-${dd}`;

  // =========================
  // Deshabilitar domingos en el calendario
  // =========================
  fechaInput.addEventListener("input", function () {
    if (!this.value) return;

    const [year, month, day] = this.value.split("-").map(Number);
    const selected = new Date(year, month - 1, day);

    if (selected.getDay() === 0) { // domingo
      alert("No se pueden sacar turnos los domingos.");
      this.value = "";
    }
  });

  // =========================
  // Generar Horarios (08:00 a 17:00 cada 15 min)
  // =========================
  function generarHoras() {
    selectHora.innerHTML = ""; // limpiar antes
    for (let h = 8; h <= 17; h++) {
      for (let m = 0; m < 60; m += 15) {
        if (h === 17 && m > 0) break;
        const hora = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        const option = document.createElement("option");
        option.value = hora;
        option.textContent = hora;
        selectHora.appendChild(option);
      }
    }
    selectHora.value = "08:00"; // valor por defecto
  }
  generarHoras();

  // =========================
  // Guardar Turno
  // =========================
  formTurno.addEventListener("submit", (e) => {
    e.preventDefault();

    const cliente = selectCliente.value;
    const tecnico = selectTecnico.value;
    const fecha = fechaInput.value;
    const hora = selectHora.value;

    if (!cliente || !tecnico || !fecha || !hora) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    // Validar domingo
    const [year, month, day] = fecha.split("-").map(Number);
    const fechaSeleccionada = new Date(year, month - 1, day);
    if (fechaSeleccionada.getDay() === 0) {
      alert("No se permiten turnos en domingo.");
      return;
    }

    // Guardar turno
    const turnos = JSON.parse(localStorage.getItem("turnos")) || [];
    const nuevoTurno = { cliente, tecnico, fecha, hora };
    turnos.push(nuevoTurno);
    localStorage.setItem("turnos", JSON.stringify(turnos));

    mostrarTurnos(turnos);
    formTurno.reset();
    selectHora.value = "08:00";
  });

  // =========================
  // Mostrar Turnos
  // =========================
  function mostrarTurnos(turnos) {
    turnosContainer.innerHTML = "";
    turnos.forEach((t, index) => {
      const div = document.createElement("div");
      div.classList.add("tarjeta-turno");
      div.innerHTML = `
        <p><strong>Cliente:</strong> ${t.cliente}</p>
        <p><strong>Técnico:</strong> ${t.tecnico}</p>
        <p><strong>Fecha:</strong> ${t.fecha}</p>
        <p><strong>Hora:</strong> ${t.hora}</p>
        <button data-index="${index}" class="btn-eliminar">Eliminar</button>
      `;
      turnosContainer.appendChild(div);
    });

    // Eliminar turno
    document.querySelectorAll(".btn-eliminar").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = e.target.dataset.index;
        turnos.splice(idx, 1);
        localStorage.setItem("turnos", JSON.stringify(turnos));
        mostrarTurnos(turnos);
      });
    });
  }

  // =========================
  // Inicializar lista de turnos
  // =========================
  mostrarTurnos(JSON.parse(localStorage.getItem("turnos")) || []);
});
