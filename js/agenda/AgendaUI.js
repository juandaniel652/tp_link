export class AgendaUI {
  constructor(agenda) {
    this.agenda = agenda;
    this.tooltip = null;
  }

  /* ==========================
   * FUNCIÓN ORQUESTADORA
   * ========================== */
  render(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const table = document.createElement('table');
    table.appendChild(this._crearEncabezado());
    table.appendChild(this._crearCuerpo());

    container.appendChild(table);
  }

  /* ==========================
   * CREACIÓN DE ELEMENTOS DOM
   * ========================== */
  _crearElemento(tag, classNames = [], textContent = '') {
    const el = document.createElement(tag);
    if (classNames.length) el.classList.add(...classNames);
    if (textContent) el.textContent = textContent;
    return el;
  }

  /* ==========================
   * ENCABEZADO DE TABLA
   * ========================== */
  _crearEncabezado() {
    const thead = this._crearElemento('thead');
    const tr = this._crearElemento('tr');

    tr.appendChild(this._crearElemento('th', ['hora'], 'Hora'));

    for (let i = 0; i < this.agenda.numDias; i++) {
      const fechaDia = new Date(this.agenda.fechaInicioSemana);
      fechaDia.setDate(fechaDia.getDate() + i);

      const textoFecha = fechaDia.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
      });

      tr.appendChild(this._crearElemento('th', [], textoFecha));
    }

    thead.appendChild(tr);
    return thead;
  }

  /* ==========================
   * TOOLTIP (MOSTRAR/OCULTAR)
   * ========================== */
  _mostrarTooltip(btn, contenido) {
    if (!this.tooltip) {
      this.tooltip = this._crearElemento('div', ['tooltip']);
      document.body.appendChild(this.tooltip);
    }

    this.tooltip.innerHTML = contenido;
    this.tooltip.style.display = 'block';

    const moveHandler = (e) => {
      Object.assign(this.tooltip.style, {
        top: `${e.pageY + 15}px`,
        left: `${e.pageX + 15}px`,
      });
    };

    btn.addEventListener('mousemove', moveHandler);
    btn.addEventListener('mouseleave', () => {
      this.tooltip.style.display = 'none';
      btn.removeEventListener('mousemove', moveHandler);
    });
  }

  /* ==========================
   * SUB-ETIQUETA DE ESTADO
   * ========================== */
  _crearSubEtiqueta(turno) {
    if (!turno.estado) return null;

    const sub = this._crearElemento('div', ['sub-etiqueta']);
    const estados = {
      Confirmado: ['OK', 'ok'],
      Rechazado: ['NOK', 'nok'],
      Reprogramado: ['REPRO', 'repro'],
    };

    const estado = estados[turno.estado];
    if (estado) {
      sub.textContent = estado[0];
      sub.classList.add(estado[1]);
    }

    return sub;
  }

  /* ==========================
   * BOTÓN DE TURNO OCUPADO
   * ========================== */
  _crearBotonTurno(turno) {
    const wrapper = this._crearElemento('div', ['bloque-turno']);
    const btn = this._crearElemento('button', ['btn-ocupado'], turno.cliente);

    btn.disabled = true;
    btn.style.backgroundColor = turno.color || '#1E90FF';

    btn.addEventListener('mouseenter', () => {
      const contenido = this._generarContenidoTooltip(turno);
      this._mostrarTooltip(btn, contenido);
    });

    wrapper.appendChild(btn);

    const sub = this._crearSubEtiqueta(turno);
    if (sub) wrapper.appendChild(sub);

    return wrapper;
  }

  _generarContenidoTooltip(turno) {
    const tecnicoStr = turno.tecnico || '';
    return `
      <strong>Cliente:</strong> ${turno.cliente}<br>
      <strong>Técnico:</strong> ${tecnicoStr}<br>
      <strong>T:</strong> ${turno.t}<br>
      <strong>Rango:</strong> ${turno.rango}<br>
      <strong>Estado:</strong> ${turno.estadoTicket}
    `;
  }

  /* ==========================
   * INDEXAR TURNOS
   * ========================== */
  _indexarTurnos() {
    const turnosIndex = {};

    this.agenda.turnos.forEach(turno => {
      const fStr = turno.fecha.replace(/\//g, '-');
      const [horaTurno, minTurno] = turno.hora.split(':').map(Number);
      const bloques = Number(turno.t || 1);

      for (let b = 0; b < bloques; b++) {
        const totalMin = horaTurno * 60 + minTurno + b * 15;
        const hh = String(Math.floor(totalMin / 60)).padStart(2, '0');
        const mm = String(totalMin % 60).padStart(2, '0');
        const bloqueHora = `${hh}:${mm}`;

        turnosIndex[fStr] ??= {};
        turnosIndex[fStr][bloqueHora] ??= [];
        turnosIndex[fStr][bloqueHora].push(turno);
      }
    });

    return turnosIndex;
  }

  /* ==========================
   * CREAR CELDA DE DÍA
   * ========================== */
  _crearCeldaDia(turnosIndex, fechaDia, hStr) {
    const td = this._crearElemento('td');
    const divBloques = this._crearElemento('div', ['bloques-container']);

    const fStr = fechaDia.toISOString().split('T')[0];
    const filtroTec = this.agenda.tecnicoFiltro || '';

    const turnosBloque = (turnosIndex[fStr]?.[hStr] || [])
      .filter(t => !filtroTec || t.tecnico === filtroTec);

    if (turnosBloque.length) {
      turnosBloque.forEach(turno => {
        divBloques.appendChild(this._crearBotonTurno(turno));
      });
    } else {
      const btnLibre = this._crearElemento('button', ['btn-libre'], '+');
      btnLibre.onclick = () => this.agenda.asignarTurno(fStr, hStr);
      divBloques.appendChild(btnLibre);
    }

    td.appendChild(divBloques);
    return td;
  }

  /* ==========================
   * CREAR FILA DE HORARIO
   * ========================== */
  _crearFilaHorario(turnosIndex, h, m) {
    const tr = this._crearElemento('tr');

    const horaInicioStr = this.agenda.formatHora(h, m);
    const finMin = m + this.agenda.minutosBloque;
    const hFin = h + Math.floor(finMin / 60);
    const mFin = finMin % 60;
    const horaFinStr = this.agenda.formatHora(hFin, mFin);

    const tdHora = this._crearElemento('td', ['hora'], `${horaInicioStr} - ${horaFinStr}`);
    tr.appendChild(tdHora);

    for (let d = 0; d < this.agenda.numDias; d++) {
      const fechaDia = new Date(this.agenda.fechaInicioSemana);
      fechaDia.setDate(fechaDia.getDate() + d);
      tr.appendChild(this._crearCeldaDia(turnosIndex, fechaDia, horaInicioStr));
    }

    return tr;
  }

  /* ==========================
   * CUERPO DE TABLA
   * ========================== */
  _crearCuerpo() {
    const tbody = this._crearElemento('tbody');
    const turnosIndex = this._indexarTurnos();

    for (let h = this.agenda.horaInicio; h < this.agenda.horaFin; h++) {
      for (let m = 0; m < 60; m += this.agenda.minutosBloque) {
        tbody.appendChild(this._crearFilaHorario(turnosIndex, h, m));
      }
    }

    return tbody;
  }
}
