document.addEventListener("DOMContentLoaded", () => {
  const formTurno = document.getElementById("formTurno");
  const fechaInput = document.getElementById("turnoFecha");
  const selectHora = document.getElementById("turnoHora");
  const selectCliente = document.getElementById("selectCliente");
  const selectTecnico = document.getElementById("selectTecnico");
  const selectT = document.getElementById("selectT");
  const selectRango = document.getElementById("selectRango");
  const selectEstadoTicket = document.getElementById("selectEstadoTicket");
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
        <span class="turno-estado confirmado">${t.estado}</span>
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
    for (let i = 1; i <= 6; i++) {
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


  function renderEstadoTicket(){
    selectEstadoTicket.innerHTML = "<option value=''>Seleccionar Estado del Ticket</option>";
    ["Abierto", "En Progreso", "Cerrado"].forEach((estado) => {
      const option = document.createElement("option");
      option.value = estado;
      option.textContent = estado;
      selectEstadoTicket.appendChild(option);
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

    let horaInicio = rango === "AM" ? 9 : 14;
    let horaFin = rango === "AM" ? 13 : 18;

    for (let h = horaInicio; h < horaFin; h++) {
      for (let m = 0; m < 60; m += 15) {
        const inicioNuevo = h * 60 + m;
        const finNuevo = inicioNuevo + bloquesT * 15;
        if (finNuevo > horaFin * 60) continue;

        // Verificar solapamiento con otros turnos del mismo técnico
        const seSolapa = turnos.some((t) => {
          if (t.fecha !== fecha || t.tecnico !== tecnico) return false;
          const durT = parseInt(t.t.replace("T", "")) * 15;
          const [hT, mT] = t.hora.split(":").map(Number);
          const inicioT = hT * 60 + mT;
          const finT = inicioT + durT;
          return inicioNuevo < finT && inicioT < finNuevo;
        });

        if (!seSolapa) {
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
      const tieneOtroTecnico = turnos.some((t) => t.cliente === clienteId && t.tecnico !== tecnico);
      const yaConEsteTecnico = turnos.some((t) => t.cliente === clienteId && t.tecnico === tecnico);
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
    return turnos.some((t) => t.fecha === nuevo.fecha && t.hora === nuevo.hora && t.tecnico === nuevo.tecnico);
  }

  function clienteYaTieneTecnico(nuevo) {
    return turnos.some((t) => t.cliente === nuevo.cliente && t.tecnico !== nuevo.tecnico);
  }

  function clienteYaTieneTurnoConTecnico(nuevo) {
    return turnos.some((t) => t.cliente === nuevo.cliente && t.tecnico === nuevo.tecnico);
  }

  function seSolapanTurnos(turnoA, turnoB) {
    if (turnoA.fecha !== turnoB.fecha || turnoA.tecnico !== turnoB.tecnico) return false;
    const durA = parseInt(turnoA.t.replace("T","")) * 15;
    const durB = parseInt(turnoB.t.replace("T","")) * 15;
    const [hA,mA] = turnoA.hora.split(":").map(Number);
    const [hB,mB] = turnoB.hora.split(":").map(Number);
    const inicioA = hA*60+mA;
    const finA = inicioA+durA;
    const inicioB = hB*60+mB;
    const finB = inicioB+durB;
    return inicioA < finB && inicioB < finA;
  }

  /** =====================
   * Eventos
   * ===================== */
  selectTecnico.addEventListener("change", () => {
    generarHorasDisponibles();
    actualizarClientesDisponibles();
  });
  selectT.addEventListener("change", generarHorasDisponibles);
  selectRango.addEventListener("change", generarHorasDisponibles);

  fechaInput.addEventListener("change", () => {
    if (!fechaInput.value) return;
    const [year, month, day] = fechaInput.value.split("-").map(Number);
    const fechaSel = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0,0,0,0);

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
      rango: selectRango.value,
      estado: selectEstadoTicket.value
    };

    if (!nuevoTurno.fecha || !nuevoTurno.hora || !nuevoTurno.cliente || !nuevoTurno.tecnico || !nuevoTurno.t || !nuevoTurno.rango || !nuevoTurno.estado) {
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

    if (turnos.some((t) => seSolapanTurnos(t, nuevoTurno))) {
      mostrarAlerta("❌ Ese turno se solapa con otro del mismo técnico.", "error");
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
    renderEstadoTicket();

    const today = new Date();
    const minDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
    fechaInput.min = minDate;
  }

  inicializar();
});
