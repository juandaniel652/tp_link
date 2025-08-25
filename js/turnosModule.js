document.addEventListener("DOMContentLoaded", () => {
  const formTurno = document.getElementById("formTurno");
  const fechaInput = document.getElementById("turnoFecha");
  const selectHora = document.getElementById("turnoHora");
  const selectCliente = document.getElementById("selectCliente");
  const selectTecnico = document.getElementById("selectTecnico");
  const selectT = document.getElementById("selectT");
  const selectRango = document.getElementById("selectRango");
  const turnosContainer = document.getElementById("turnosContainer");

  let turnos = JSON.parse(localStorage.getItem("turnos")) || [];
  let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  let tecnicos = JSON.parse(localStorage.getItem("tecnicos")) || [];

  /** =====================
   * Helpers
   * ===================== */
  function guardarTurnos() {
    localStorage.setItem("turnos", JSON.stringify(turnos));
  }

  function mostrarAlerta(mensaje, tipo = "info") {
    const alertaPrevia = document.querySelector(".mensaje");
    if (alertaPrevia) alertaPrevia.remove();

    const alerta = document.createElement("div");
    alerta.className = `mensaje ${tipo}`;
    alerta.textContent = mensaje;
    formTurno.prepend(alerta);

    setTimeout(() => alerta.remove(), 3500);
  }

  function renderTurnos() {
    turnosContainer.innerHTML = "";

    if (turnos.length === 0) {
      turnosContainer.innerHTML = `<p>No hay turnos registrados</p>`;
      return;
    }

    turnos.forEach((t, index) => {
      const card = document.createElement("div");
      card.classList.add("tarjeta-turno");

      card.innerHTML = `
        <h3>📅 ${t.fecha} - ⏰ ${t.hora}</h3>
        <p><strong>Cliente:</strong> ${t.cliente}</p>
        <p><strong>Técnico:</strong> ${t.tecnico}</p>
        <p><strong>T:</strong> ${t.t}</p>
        <p><strong>Rango:</strong> ${t.rango}</p>
        <span class="turno-estado confirmado">Confirmado</span>
        <br><br>
        <button data-index="${index}" class="btn-eliminar">Eliminar</button>
      `;

      turnosContainer.appendChild(card);
    });

    document.querySelectorAll(".btn-eliminar").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = e.target.dataset.index;
        turnos.splice(idx, 1);
        guardarTurnos();
        renderTurnos();
        generarHorasDisponibles();
        actualizarClientesDisponibles();
        mostrarAlerta("✅ Turno eliminado.", "success");
      });
    });
  }

  function renderTecnicos() {
    selectTecnico.innerHTML = "<option value=''>Seleccione técnico</option>";
    tecnicos.forEach((t) => {
      const option = document.createElement("option");
      option.value = t.nombre;
      option.textContent = `${t.nombre}${t.especialidad ? " (" + t.especialidad + ")" : ""}`;
      selectTecnico.appendChild(option);
    });
  }

  function renderClientes() {
    selectCliente.innerHTML = "<option value=''>Seleccione cliente</option>";
    clientes.forEach((c) => {
      const option = document.createElement("option");
      option.value = `${c.numeroCliente} - ${c.nombre} ${c.apellido}`;
      option.textContent = option.value;
      selectCliente.appendChild(option);
    });
  }

  function renderT() {
    selectT.innerHTML = "<option value=''>Seleccionar T</option>";
    for (let i = 1; i <= 16; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = `T${i} (${i * 15} min)`;
      selectT.appendChild(option);
    }
  }

  function renderRango() {
    selectRango.innerHTML = "<option value=''>Seleccionar Rango</option>";
    ["AM", "PM"].forEach((rango) => {
      const option = document.createElement("option");
      option.value = rango;
      option.textContent = rango;
      selectRango.appendChild(option);
    });
  }

  // === Generar horas disponibles considerando T y Rango ===
  function generarHorasDisponibles() {
    selectHora.innerHTML = "<option value=''>Seleccione hora</option>";
    const fecha = fechaInput.value;
    const tecnico = selectTecnico.value;
    const bloquesT = parseInt(selectT.value) || 1;
    const rango = selectRango.value;

    if (!fecha || !tecnico || !rango) return;

    // definir límites por rango
    let horaInicio = rango === "AM" ? 8 : 12;
    let horaFin = rango === "AM" ? 11 : 17;

    for (let h = horaInicio; h <= horaFin; h++) {
      for (let m = 0; m < 60; m += 15) {
        if (h === horaFin && m > 0) break;

        let puedeAsignar = true;
        for (let b = 0; b < bloquesT; b++) {
          let totalMinutos = h * 60 + m + b * 15;
          let hh = Math.floor(totalMinutos / 60);
          let mm = totalMinutos % 60;
          if (hh > 17) {
            puedeAsignar = false;
            break;
          }
          const horaCheck = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
          if (turnos.some((t) => t.fecha === fecha && t.hora === horaCheck && t.tecnico === tecnico)) {
            puedeAsignar = false;
            break;
          }
        }

        if (puedeAsignar) {
          const hora = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
          const option = document.createElement("option");
          option.value = hora;
          option.textContent = hora;
          selectHora.appendChild(option);
        }
      }
    }
  }

  function actualizarClientesDisponibles() {
    if (!selectTecnico.value || !fechaInput.value) return; 
    selectCliente.innerHTML = "<option value=''>Seleccione cliente</option>";
    const tecnico = selectTecnico.value;

    const clientesDisponibles = clientes.filter((c) => {
      const clienteId = `${c.numeroCliente} - ${c.nombre} ${c.apellido}`;

      const tieneOtroTecnico = turnos.some(
        (t) => t.cliente === clienteId && t.tecnico !== tecnico
      );

      const yaConEsteTecnico = turnos.some(
        (t) => t.cliente === clienteId && t.tecnico === tecnico
      );

      return !tieneOtroTecnico && !yaConEsteTecnico;
    });

    if (clientesDisponibles.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No hay clientes disponibles";
      selectCliente.appendChild(option);
    } else {
      clientesDisponibles.forEach((c) => {
        const option = document.createElement("option");
        option.value = `${c.numeroCliente} - ${c.nombre} ${c.apellido}`;
        option.textContent = option.value;
        selectCliente.appendChild(option);
      });
    }
  }

  /** =====================
   * Validaciones
   * ===================== */
  function esTurnoDuplicado(nuevo) {
    return turnos.some(
      (t) => t.fecha === nuevo.fecha && t.hora === nuevo.hora && t.tecnico === nuevo.tecnico
    );
  }

  function clienteYaTieneTecnico(nuevo) {
    return turnos.some(
      (t) => t.cliente === nuevo.cliente && t.tecnico !== nuevo.tecnico
    );
  }

  function clienteYaTieneTurnoConTecnico(nuevo) {
    return turnos.some(
      (t) => t.cliente === nuevo.cliente && t.tecnico === nuevo.tecnico
    );
  }

  /** =====================
   * Eventos
   * ===================== */
  selectTecnico.addEventListener("change", () => {
    generarHorasDisponibles();
    actualizarClientesDisponibles();
  });

  selectT.addEventListener("change", () => {
    generarHorasDisponibles();
  });

  selectRango.addEventListener("change", () => {
    generarHorasDisponibles();
  });

  fechaInput.addEventListener("change", () => {
    if (!fechaInput.value) return;
    const [year, month, day] = fechaInput.value.split("-").map(Number);
    const fechaSel = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (fechaSel < today) {
      mostrarAlerta("⚠️ No puedes elegir un día anterior a hoy.", "error");
      fechaInput.value = "";
      return;
    }

    if (fechaSel.getDay() === 0) {
      mostrarAlerta("⚠️ No se pueden sacar turnos los domingos.", "error");
      fechaInput.value = "";
      return;
    }

    generarHorasDisponibles();
    actualizarClientesDisponibles();
  });

  formTurno.addEventListener("submit", (e) => {
    e.preventDefault();

    const nuevoTurno = {
      fecha: fechaInput.value,
      hora: selectHora.value,
      cliente: selectCliente.value,
      tecnico: selectTecnico.value,
      t: `T${selectT.value}`,
      rango: selectRango.value
    };

    if (!nuevoTurno.fecha || !nuevoTurno.hora || !nuevoTurno.cliente || !nuevoTurno.tecnico || !nuevoTurno.t || !nuevoTurno.rango) {
      mostrarAlerta("⚠️ Por favor, complete todos los campos.", "error");
      return;
    }

    if (esTurnoDuplicado(nuevoTurno)) {
      mostrarAlerta("❌ Ese turno ya está ocupado con este técnico.", "error");
      return;
    }

    if (clienteYaTieneTecnico(nuevoTurno)) {
      mostrarAlerta("❌ Un cliente solo puede tener un técnico asignado.", "error");
      return;
    }

    if (clienteYaTieneTurnoConTecnico(nuevoTurno)) {
      mostrarAlerta("⚠️ El cliente ya tiene turno con este técnico.", "error");
      return;
    }

    turnos.push(nuevoTurno);
    guardarTurnos();
    renderTurnos();

    formTurno.reset();
    generarHorasDisponibles();
    mostrarAlerta("✅ Turno registrado con éxito.", "success");
  });

  /** =====================
   * Inicialización
   * ===================== */
  function inicializar() {
    renderTurnos();
    renderClientes();
    renderTecnicos();
    renderT();
    renderRango();

    const today = new Date();
    const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
    fechaInput.min = minDate;
  }

  inicializar();
});
