document.addEventListener("DOMContentLoaded", () => {
  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  const puntosAcceso = JSON.parse(localStorage.getItem("puntosAcceso")) || [];
  const tecnicos = JSON.parse(localStorage.getItem("tecnicos")) || [];
  let turnos = JSON.parse(localStorage.getItem("turnos")) || [];

  const T_VALUES = [1, 2, 3, 4, 5, 6];
  const RANGOS = ["AM", "PM"];
  const NOMBRES_DIAS = {
    domingo: 'Domingo', lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
    jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado'
  };
  const DAYS = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];

  const selectCliente = document.getElementById("selectCliente");
  const selectNap = document.getElementById("selectNap");
  const selectT = document.getElementById("selectT");
  const selectRango = document.getElementById("selectRango");
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


    // === Función para formatear rango horario según T ===
  function formatearRango(horaBase, tNum) {
    const [h, m] = horaBase.split(":").map(Number);

    // Hora de inicio
    const inicio = new Date();
    inicio.setHours(h, m);

    // Hora de fin según cantidad de bloques T
    const fin = new Date(inicio);
    fin.setMinutes(inicio.getMinutes() + tNum * 15);

    const pad = (n) => n.toString().padStart(2,"0");
    const inicioStr = `${pad(inicio.getHours())}:${pad(inicio.getMinutes())}`;
    const finStr = `${pad(fin.getHours())}:${pad(fin.getMinutes())}`;

    const duracion = tNum * 15;
    return `${inicioStr} - ${finStr} (${duracion} Minutos)`;
  }


  // === FUNCIONES ===
  function renderGrillaTurnos(clienteId, napNumero, tSeleccionado, rangoSeleccionado) {
    turnosContainer.innerHTML = "";
    const cliente = clientes.find(c => String(c.numeroCliente) === String(clienteId));
    const nap = puntosAcceso.find(p => String(p.numero) === String(napNumero));
    if (!cliente || !nap) return alert("Cliente o NAP no encontrado");
    
    const napStr = String(nap.numero);
    const tecnicosDisp = tecnicos.filter(t =>
      Array.isArray(t.puntosAcceso) && t.puntosAcceso.map(String).includes(napStr)
    );
    if (!tecnicosDisp.length) return alert("No hay técnicos que cubran este NAP");
  
    const tNum = Number(tSeleccionado);
    const horaBase = rangoSeleccionado === "AM" ? 9 : 14;
    const minutos = (tNum - 1) * 15;
    const horaStr = `${horaBase.toString().padStart(2,"0")}:${minutos.toString().padStart(2,"0")}`;
  
    if (turnos.some(turno => turno.clienteId === cliente.numeroCliente)) {
      return alert("Este cliente ya tiene un turno asignado.");
    }
  
    const diasDisponiblesNAP = nap.dias && Array.isArray(nap.dias) ? nap.dias.map(d => d.toLowerCase()) : DAYS;
  
    // === Generar fechas próximas (desde mañana en adelante) ===
    // === Generar fechas próximas correlativas (desde mañana en adelante, sin domingos) ===
    const hoy = new Date();
    const fechasOpciones = [];
    let fecha = new Date(hoy);

    while (fechasOpciones.length < 3) {
      fecha.setDate(fecha.getDate() + 1); // avanzar un día
      const diaNombre = DAYS[fecha.getDay()];
    
      // saltar domingos
      if (diaNombre === "domingo") continue;
    
      // verificar si el NAP atiende ese día
      if (!diasDisponiblesNAP.includes(diaNombre)) continue;
    
      const fechaISO = fecha.toISOString().slice(0,10);
    
      // evitar conflicto con otros turnos
      const conflicto = turnos.some(turno =>
        (turno.clienteId === cliente.numeroCliente) ||
        (turno.fecha === fechaISO && turno.hora === horaStr && turno.nap === nap.numero)
      );
    
      if (!conflicto) {
        fechasOpciones.push({ fecha: new Date(fecha), fechaISO, diaNombre });
      }
    }

  
    if (!fechasOpciones.length) return alert("No hay fechas próximas disponibles para este NAP");
  
    fechasOpciones.forEach(opcion => {
      const card = document.createElement("div");
      card.className = "card-turno";
      card.innerHTML = `
        <h3>${NOMBRES_DIAS[opcion.diaNombre]} ${opcion.fecha.toLocaleDateString("es-ES",{day:"numeric", month:"long"})}</h3>
        <p><strong>Cliente:</strong> ${cliente.numeroCliente} - ${cliente.nombre} ${cliente.apellido}</p>
        <p><strong>NAP:</strong> NAP ${nap.numero}</p>
        <p><strong>T:</strong> ${tNum}</p>
        <p><strong>Rango:</strong> ${rangoSeleccionado}</p>
        <p><strong>Horario:</strong> ${formatearRango(horaStr, tNum)}</p>
        <p><strong>Técnicos disponibles:</strong> ${tecnicosDisp.map(t => t.nombre + ' ' + (t.apellido||'')).join(", ")}</p>
        <button class="btnSeleccionarTurno">Seleccionar</button>
      `;
    
      card.querySelector(".btnSeleccionarTurno").addEventListener("click", () => {
        const disponibles = tecnicosDisp.filter(t =>
          !turnos.some(turno =>
            turno.fecha === opcion.fechaISO &&
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
          fecha: opcion.fechaISO,
          fechaStr: `${NOMBRES_DIAS[opcion.diaNombre]} ${opcion.fecha.toLocaleDateString("es-ES",{day:"numeric", month:"long"})}`,
          hora: horaStr,
          tecnicos: [tecnicoElegido.nombre + ' ' + (tecnicoElegido.apellido||'')]
        };
      
        turnos.push(nuevoTurno);
        localStorage.setItem("turnos", JSON.stringify(turnos));
        alert(`Turno guardado. Técnico asignado: ${tecnicoElegido.nombre} ${tecnicoElegido.apellido||''}`);
        renderHistorialTurnos();
        turnosContainer.innerHTML = "";
      });
    
      turnosContainer.appendChild(card);
    });
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
    
      // === Ordenar turnos por fecha de manera ascendente (más cercana primero) ===
      const turnosOrdenados = [...turnos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    
      turnosOrdenados.forEach(t => {
        const card = document.createElement("div");
        card.className = "card-turno";
        card.innerHTML = `
          <h3>${t.fechaStr || t.fecha}</h3>
          <p><strong>Cliente:</strong> ${t.clienteId} - ${t.cliente}</p>
          <p><strong>NAP:</strong> ${t.nap}</p>
          <p><strong>T:</strong> ${t.t}</p>
          <p><strong>Rango:</strong> ${t.rango}</p>
          <p><strong>Horario:</strong> ${formatearRango(t.hora, t.t)}</p>
          <p><strong>Técnicos:</strong> ${t.tecnicos.length ? t.tecnicos.join(", ") : "Sin técnico asignado"}</p>
          <button class="btnEliminarTurno" data-id="${t.id}">❌ Eliminar</button>
        `;
        historial.appendChild(card);
      });
    
      document.querySelectorAll(".btnEliminarTurno").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const id = e.target.dataset.id;
          turnos = turnos.filter(t => String(t.id) !== String(id));
          localStorage.setItem("turnos", JSON.stringify(turnos));
          renderHistorialTurnos();
        });
      });
    }

  btnMostrarTurnos.addEventListener("click", () => {
    const clienteId = selectCliente.value;
    const napNumero = selectNap.value;
    const tSeleccionado = selectT.value;
    const rangoSeleccionado = selectRango.value;

    if (!clienteId || !napNumero || !tSeleccionado || !rangoSeleccionado)
      return alert("Debe seleccionar Cliente, NAP, T y Rango");

    renderGrillaTurnos(clienteId, napNumero, tSeleccionado, rangoSeleccionado);
  });

  renderHistorialTurnos();
});
