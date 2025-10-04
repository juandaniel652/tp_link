export class AgendaUI {
  constructor(agenda) {
    this.agenda = agenda;
    this.tooltip = null; // Tooltip único reutilizable
  }

  /* ==========================
   * CREAR ENCABEZADO
   * ========================== */
  crearEncabezado() {
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');

    const thHora = document.createElement('th');
    thHora.textContent = 'Hora';
    thHora.classList.add('hora');
    tr.appendChild(thHora);

    for (let i = 0; i < this.agenda.numDias; i++) {
      const fechaDia = new Date(this.agenda.fechaInicioSemana);
      fechaDia.setDate(fechaDia.getDate() + i);

      const th = document.createElement('th');
      th.textContent = fechaDia.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit'
      });
      tr.appendChild(th);
    }

    thead.appendChild(tr);
    return thead;
  }

  /* ==========================
   * TOOLTIP
   * ========================== */
  mostrarTooltip(btn, contenido) {
    if (!this.tooltip) {
      this.tooltip = document.createElement('div');
      this.tooltip.classList.add('tooltip');
      document.body.appendChild(this.tooltip);
    }
    this.tooltip.innerHTML = contenido;
    this.tooltip.style.display = 'block';

    const moveHandler = (e) => {
      this.tooltip.style.top = e.pageY + 15 + "px";
      this.tooltip.style.left = e.pageX + 15 + "px";
    };

    btn.addEventListener('mousemove', moveHandler);
    btn.addEventListener('mouseleave', () => {
      this.tooltip.style.display = 'none';
      btn.removeEventListener('mousemove', moveHandler);
    });
  }

  /* ==========================
   * CREAR SUB-ETIQUETA DE ESTADO
   * ========================== */
  crearSubEtiqueta(turno) {
    if (!turno.estado) return null;

    const sub = document.createElement("div");
    sub.classList.add("sub-etiqueta");

    switch (turno.estado) {
      case "Confirmado": sub.textContent = "OK"; sub.classList.add("ok"); break;
      case "Rechazado": sub.textContent = "NOK"; sub.classList.add("nok"); break;
      case "Reprogramado": sub.textContent = "REPRO"; sub.classList.add("repro"); break;
    }

    return sub;
  }

  /* ==========================
   * CREAR BOTÓN DE TURNO
   * ========================== */
  crearBotonTurno(turno) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('bloque-turno');

    const btn = document.createElement('button');
    btn.textContent = turno.cliente;
    btn.disabled = true;
    btn.classList.add('btn-ocupado');
    btn.style.backgroundColor = turno.color || '#1E90FF';

    // Tooltip
    btn.addEventListener('mouseenter', () => {
      const tecnicoStr = turno.tecnico || ""; // 🔹 ahora string, no array
      const contenido = `
        <strong>Cliente:</strong> ${turno.cliente}<br>
        <strong>Técnico:</strong> ${tecnicoStr}<br>
        <strong>T:</strong> ${turno.t}<br>
        <strong>Rango:</strong> ${turno.rango}<br>
        <strong>Estado:</strong> ${turno.estadoTicket}
      `;
      this.mostrarTooltip(btn, contenido);
    });

    wrapper.appendChild(btn);

    const sub = this.crearSubEtiqueta(turno);
    if (sub) wrapper.appendChild(sub);

    return wrapper;
  }

  /* ==========================
   * CREAR CUERPO
   * ========================== */
  crearCuerpo() {
    const tbody = document.createElement('tbody');

    // 🔹 Indexar turnos por fecha y hora
    const turnosIndex = {};
    this.agenda.turnos.forEach(turno => {
      const fStr = turno.fecha.replace(/\//g, '-');
      const [horaTurno, minTurno] = turno.hora.split(':').map(Number);
      const bloquesTurno = Number(turno.t || 1);

      for (let b = 0; b < bloquesTurno; b++) {
        const totalMin = horaTurno * 60 + minTurno + b * 15;
        const hh = Math.floor(totalMin / 60);
        const mm = totalMin % 60;
        const bloqueHora = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;

        if (!turnosIndex[fStr]) turnosIndex[fStr] = {};
        if (!turnosIndex[fStr][bloqueHora]) turnosIndex[fStr][bloqueHora] = [];
        turnosIndex[fStr][bloqueHora].push(turno);
      }
    });

    const horaInicio = this.agenda.horaInicio;
    const horaFin = this.agenda.horaFin;

    for (let h = horaInicio; h < horaFin; h++) {
      for (let m = 0; m < 60; m += this.agenda.minutosBloque) {
        const tr = document.createElement('tr');

        // Columna hora
        const tdHora = document.createElement('td');
        tdHora.classList.add('hora');
        const hFin = h + Math.floor((m + this.agenda.minutosBloque) / 60);
        const mFin = (m + this.agenda.minutosBloque) % 60;
        const hStr = this.agenda.pad(h) + ':' + this.agenda.pad(m);
        tdHora.textContent = `${this.agenda.formatHora(h, m)} - ${this.agenda.formatHora(hFin, mFin)}`;
        tr.appendChild(tdHora);

        // Columnas por día
        for (let d = 0; d < this.agenda.numDias; d++) {
          const td = document.createElement('td');
          const fechaDia = new Date(this.agenda.fechaInicioSemana);
          fechaDia.setDate(fechaDia.getDate() + d);
          const fStr = fechaDia.toISOString().split('T')[0];
          const filtroTec = this.agenda.tecnicoFiltro || '';

          const divBloques = document.createElement('div');
          divBloques.classList.add('bloques-container');

          const turnosBloque = (turnosIndex[fStr]?.[hStr] || []).filter(turno =>
            !filtroTec || turno.tecnico === filtroTec
          );

          turnosBloque.forEach(turno => {
            divBloques.appendChild(this.crearBotonTurno(turno));
          });

          // Botón libre si no hay turnos
          if (!divBloques.childElementCount) {
            const btnLibre = document.createElement('button');
            btnLibre.textContent = '+';
            btnLibre.classList.add('btn-libre');
            btnLibre.onclick = () => this.agenda.asignarTurno(fStr, hStr);
            divBloques.appendChild(btnLibre);
          }

          td.appendChild(divBloques);
          tr.appendChild(td);
        }

        tbody.appendChild(tr);
      }
    }

    return tbody;
  }

  /* ==========================
   * RENDER
   * ========================== */
  render(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const table = document.createElement('table');
    table.appendChild(this.crearEncabezado());
    table.appendChild(this.crearCuerpo());

    container.appendChild(table);
  }
}
