document.addEventListener("DOMContentLoaded", () => {
  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  const puntosAcceso = JSON.parse(localStorage.getItem("puntosAcceso")) || [];
  const tecnicos = JSON.parse(localStorage.getItem("tecnicos")) || [];
  let turnos = JSON.parse(localStorage.getItem("turnos")) || [];

  const T_VALUES = [1, 2, 3, 4, 5, 6];
  const RANGOS = ["AM", "PM"];
  const ESTADOS = ["Pendiente", "En curso", "Finalizado"];
  const NOMBRES_DIAS = {
    domingo: 'Domingo', lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
    jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado'
  };
  const DAYS = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];

  const selectCliente = document.getElementById("selectCliente");
  const selectNap = document.getElementById("selectNap");
  const selectT = document.getElementById("selectT");
  const selectRango = document.getElementById("selectRango");
  const selectEstadoTicket = document.getElementById("selectEstadoTicket");
  const turnosContainer = document.getElementById("turnosContainer");
  const btnMostrarTurnos = document.getElementById("btnMostrarTurnos");

  // === RENDER SELECTS ===
  function renderSelectClientes() {
    selectCliente.innerHTML = `<option value="">Seleccionar Cliente</option>`;
    clientes.forEach(c => {
      const option = document.createElement("option");
      option.value = String(c.numeroCliente);
      option.textContent = `${c.numeroCliente} - ${c.nombre} ${c.apellido}`.trim();
      selectCliente.appendChild(option);
    });
  }

  function renderSelectNaps() {
    selectNap.innerHTML = `<option value="">Seleccionar NAP</option>`;
    puntosAcceso.forEach(p => {
      const option = document.createElement("option");
      option.value = String(p.numero);
      option.textContent = `NAP ${p.numero}`;
      selectNap.appendChild(option);
    });
  }

  function renderSelectGen(selectEl, items, placeholder) {
    selectEl.innerHTML = `<option value="">${placeholder}</option>`;
    items.forEach(i => {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      selectEl.appendChild(option);
    });
  }

  renderSelectClientes();
  renderSelectNaps();
  renderSelectGen(selectT, T_VALUES, "Seleccionar T");
  renderSelectGen(selectRango, RANGOS, "Seleccionar Rango");
  renderSelectGen(selectEstadoTicket, ESTADOS, "Seleccionar Estado");

  // === FUNCIONES ===
  function renderGrillaTurnos(clienteId, napNumero, tSeleccionado, rangoSeleccionado, estadoSeleccionado) {
    turnosContainer.innerHTML = "";
    const cliente = clientes.find(c => String(c.numeroCliente) === String(clienteId));
    const nap = puntosAcceso.find(p => String(p.numero) === String(napNumero));
    if (!cliente || !nap) return alert("Cliente o NAP no encontrado");

    const napStr = String(nap.numero);
    const tecnicosDisp = tecnicos.filter(t =>
      Array.isArray(t.puntosAcceso) && t.puntosAcceso.map(String).includes(napStr)
    );
    if (!tecnicosDisp.length) return alert("No hay técnicos que cubran este NAP");

    const hoy = new Date();
    const fechaISO = hoy.toISOString().slice(0,10);
    const diaStr = DAYS[hoy.getDay()];
    const diaNombre = NOMBRES_DIAS[diaStr];

    const tNum = Number(tSeleccionado);
    const horaBase = rangoSeleccionado === "AM" ? 9 : 14;
    const minutos = (tNum - 1) * 15;
    const horaStr = `${horaBase.toString().padStart(2,"0")}:${minutos.toString().padStart(2,"0")}`;

    // === VALIDACIONES ===
    if (turnos.some(turno => turno.clienteId === cliente.numeroCliente)) {
      return alert("Este cliente ya tiene un turno asignado.");
    }

    if (turnos.some(turno =>
      turno.clienteId === cliente.numeroCliente &&
      turno.fecha === fechaISO
    )) {
      return alert("Este cliente ya tiene un turno en esta fecha.");
    }

    if (turnos.some(turno =>
      turno.fecha === fechaISO &&
      turno.hora === horaStr &&
      turno.nap === nap.numero
    )) {
      return alert("Este turno ya está ocupado en este NAP.");
    }

    const card = document.createElement("div");
    card.className = "card-turno";
    card.innerHTML = `
      <h3>${diaNombre} ${hoy.toLocaleDateString("es-ES",{day:"numeric", month:"long"})}</h3>
      <p><strong>Cliente:</strong> ${cliente.numeroCliente} - ${cliente.nombre} ${cliente.apellido}</p>
      <p><strong>NAP:</strong> NAP ${nap.numero}</p>
      <p><strong>T:</strong> ${tNum}</p>
      <p><strong>Rango:</strong> ${rangoSeleccionado}</p>
      <p><strong>Técnicos disponibles:</strong> ${tecnicosDisp.map(t => t.nombre + ' ' + (t.apellido||'')).join(", ")}</p>
      <p><strong>Estado:</strong> ${estadoSeleccionado}</p>
      <button id="btnSeleccionarTurno">Seleccionar</button>
    `;

    // evento botón
    card.querySelector("#btnSeleccionarTurno").addEventListener("click", () => {
      const disponibles = tecnicosDisp.filter(t =>
        !turnos.some(turno =>
          turno.fecha === fechaISO &&
          turno.hora === horaStr &&
          turno.tecnicos.includes(t.nombre + ' ' + (t.apellido||''))
        )
      );

      if (!disponibles.length) return alert("No hay técnicos disponibles para este horario");

      const tecnicoElegido = disponibles.reduce((prev, curr) => {
        const prevCount = turnos.filter(turno =>
          turno.tecnicos.includes(prev.nombre + ' ' + (prev.apellido||''))).length;
        const currCount = turnos.filter(turno =>
          turno.tecnicos.includes(curr.nombre + ' ' + (curr.apellido||''))).length;
        return prevCount <= currCount ? prev : curr;
      });

      const nuevoTurno = {
        id: Date.now(),
        clienteId: cliente.numeroCliente,
        cliente: `${cliente.nombre} ${cliente.apellido}`.trim(),
        nap: nap.numero,
        t: tNum,
        rango: rangoSeleccionado,
        fecha: fechaISO,
        fechaStr: `${diaNombre} ${hoy.toLocaleDateString("es-ES",{day:"numeric", month:"long"})}`,
        hora: horaStr,
        tecnicos: [tecnicoElegido.nombre + ' ' + (tecnicoElegido.apellido||'')],
        estado: estadoSeleccionado
      };

      turnos.push(nuevoTurno);
      localStorage.setItem("turnos", JSON.stringify(turnos));
      alert(`Turno guardado. Técnico asignado: ${tecnicoElegido.nombre} ${tecnicoElegido.apellido||''}`);

      renderHistorialTurnos();
      turnosContainer.innerHTML = "";
    });

    turnosContainer.appendChild(card);
  }

  function renderHistorialTurnos() {
    let historial = document.getElementById("historialTurnos");
    if (!historial) {
      historial = document.createElement("div");
      historial.id = "historialTurnos";
      turnosContainer.appendChild(historial);
    }
    historial.innerHTML = "<h2>Historial de Turnos</h2>";
    if (!turnos.length) {
      historial.innerHTML += `<p style="text-align:center;color:#555;">No hay turnos registrados.</p>`;
      return;
    }

    turnos.forEach(t => {
      const card = document.createElement("div");
      card.className = "card-turno";
      card.innerHTML = `
        <h3>${t.fechaStr || t.fecha}</h3>
        <p><strong>Cliente:</strong> ${t.clienteId} - ${t.cliente}</p>
        <p><strong>NAP:</strong> NAP ${t.nap}</p>
        <p><strong>T:</strong> ${t.t}</p>
        <p><strong>Rango:</strong> ${t.rango}</p>
        <p><strong>Técnicos:</strong> ${t.tecnicos.join(", ")}</p>
        <p><strong>Estado:</strong> ${t.estado}</p>
        <button class="btnEliminarTurno" data-id="${t.id}">❌ Eliminar</button>
      `;
      historial.appendChild(card);
    });

    // Eventos de eliminar
    document.querySelectorAll(".btnEliminarTurno").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        turnos = turnos.filter(t => String(t.id) !== String(id));
        localStorage.setItem("turnos", JSON.stringify(turnos));
        renderHistorialTurnos();
      });
    });
  }

  // === BOTÓN MOSTRAR TURNOS ===
  btnMostrarTurnos.addEventListener("click", () => {
    const clienteId = selectCliente.value;
    const napNumero = selectNap.value;
    const tSeleccionado = selectT.value;
    const rangoSeleccionado = selectRango.value;
    const estadoSeleccionado = selectEstadoTicket.value;

    if (!clienteId || !napNumero || !tSeleccionado || !rangoSeleccionado || !estadoSeleccionado)
      return alert("Debe seleccionar Cliente, NAP, T, Rango y Estado");

    renderGrillaTurnos(clienteId, napNumero, tSeleccionado, rangoSeleccionado, estadoSeleccionado);
  });

  // === INICIAL ===
  renderHistorialTurnos();
});
