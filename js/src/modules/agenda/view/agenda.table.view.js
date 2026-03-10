import { formatHora } from '../utils/agenda.utils.js';

export class AgendaTableView {
  /**
   * @param {import('../controller/agenda.controller.js').AgendaController} ctrl
   */
  constructor(ctrl) {
    this.ctrl    = ctrl;
    this.tooltip = null;
  }

  /* ─────────────────────────────────────────────────────────────────
   * RENDER COMPLETO
   * ───────────────────────────────────────────────────────────────── */
  render(container) {
    container.innerHTML = '';

    const { navView } = this.ctrl;
    container.appendChild(navView.render());

    const table = document.createElement('table');
    table.appendChild(this._encabezado());
    table.appendChild(this._cuerpo());
    container.appendChild(table);
  }

  /* ─────────────────────────────────────────────────────────────────
   * SOLO REFRESCAR TBODY (sin recrear nav ni thead)
   * ───────────────────────────────────────────────────────────────── */
  refrescarCuerpo(container) {
    const table = container.querySelector('table');
    if (!table) return;
    table.querySelector('tbody')?.remove();
    table.appendChild(this._cuerpo());
  }

  /* ─────────────────────────────────────────────────────────────────
   * ENCABEZADO
   * ───────────────────────────────────────────────────────────────── */
  _encabezado() {
    const { fechaInicioSemana, numDias } = this.ctrl.state;
    const thead = document.createElement('thead');
    const tr    = document.createElement('tr');

    const thHora = document.createElement('th');
    thHora.textContent = 'Hora';
    thHora.classList.add('hora');
    tr.appendChild(thHora);

    for (let i = 0; i < numDias; i++) {
      const d = new Date(fechaInicioSemana);
      d.setDate(d.getDate() + i);
      const th = document.createElement('th');
      th.textContent = d.toLocaleDateString('es-ES', {
        weekday: 'long',
        day:     '2-digit',
        month:   '2-digit'
      });
      tr.appendChild(th);
    }

    thead.appendChild(tr);
    return thead;
  }

  /* ─────────────────────────────────────────────────────────────────
   * CUERPO
   * ───────────────────────────────────────────────────────────────── */
  _cuerpo() {
    const { horaInicio, horaFin, minutosBloque, numDias,
            fechaInicioSemana, tecnicoFiltro, turnos } = this.ctrl.state;

    const tbody  = document.createElement('tbody');
    const index  = this.ctrl.service.indexarPorFechaHora(turnos, minutosBloque);

    for (let h = horaInicio; h < horaFin; h++) {
      for (let m = 0; m < 60; m += minutosBloque) {
        const tr = document.createElement('tr');

        /* columna hora */
        const hFin = h + Math.floor((m + minutosBloque) / 60);
        const mFin = (m + minutosBloque) % 60;
        const tdHora = document.createElement('td');
        tdHora.classList.add('hora');
        tdHora.textContent = `${formatHora(h, m)} - ${formatHora(hFin, mFin)}`;
        tr.appendChild(tdHora);

        /* columnas por día */
        for (let d = 0; d < numDias; d++) {
          const dia   = new Date(fechaInicioSemana);
          dia.setDate(dia.getDate() + d);
          const fStr  = dia.toISOString().split('T')[0];
          const hStr  = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;

          const td    = document.createElement('td');
          const div   = document.createElement('div');
          div.classList.add('bloques-container');

          const turnosBloque = (index[fStr]?.[hStr] || []).filter(t =>
            !tecnicoFiltro ||
              t.tecnico?.id === tecnicoFiltro  
          );

          turnosBloque.forEach(t => div.appendChild(this._botonTurno(t)));

          if (!div.childElementCount) {
            const btnLibre = document.createElement('button');
            btnLibre.textContent = '+';
            btnLibre.classList.add('btn-libre');
            btnLibre.onclick = () => this.ctrl.onAsignarTurno(fStr, hStr);
            div.appendChild(btnLibre);
          }

          td.appendChild(div);
          tr.appendChild(td);
        }

        tbody.appendChild(tr);
      }
    }

    return tbody;
  }

  /* ─────────────────────────────────────────────────────────────────
   * BOTÓN DE TURNO OCUPADO
   * ───────────────────────────────────────────────────────────────── */
  _botonTurno(turno) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('bloque-turno');

    const btn = document.createElement('button');
    btn.textContent = this._nombrePersona(turno.cliente);
    btn.disabled    = true;
    btn.classList.add('btn-ocupado');

    // Color de acento en franja izquierda si viene con color
    if (turno.color) {
      btn.style.borderLeftColor = turno.color;
    }

    btn.addEventListener('mouseenter', (e) => {
      this._mostrarTooltip(e, turno);
    });

    btn.addEventListener('mousemove', (e) => {
      this._posicionarTooltip(e);
    });

    btn.addEventListener('mouseleave', () => {
      this._ocultarTooltip();
    });

    wrapper.appendChild(btn);

    const sub = this._subEtiqueta(turno);
    if (sub) wrapper.appendChild(sub);

    return wrapper;
  }

  /* ─────────────────────────────────────────────────────────────────
   * SUB-ETIQUETA DE ESTADO
   * ───────────────────────────────────────────────────────────────── */
  _subEtiqueta(turno) {
    if (!turno.estado) return null;

    const MAP = {
      Confirmado:   ['OK',    'ok'],
      Rechazado:    ['NOK',   'nok'],
      Reprogramado: ['REPRO', 'repro']
    };

    const entry = MAP[turno.estado];
    if (!entry) return null;

    const sub = document.createElement('div');
    sub.classList.add('sub-etiqueta', entry[1]);
    sub.textContent = entry[0];
    return sub;
  }

  /* ─────────────────────────────────────────────────────────────────
   * TOOLTIP PROFESIONAL
   * ───────────────────────────────────────────────────────────────── */
  _crearTooltip() {
    const el = document.createElement('div');
    el.classList.add('tooltip');

    const header = document.createElement('div');
    header.classList.add('tooltip-header');
    header.textContent = 'Detalle del turno';

    const body = document.createElement('div');
    body.classList.add('tooltip-body');

    el.appendChild(header);
    el.appendChild(body);
    document.body.appendChild(el);
    return el;
  }

  _filaTooltip(label, value) {
    if (!value) return null;
    const row = document.createElement('div');
    row.classList.add('tooltip-row');

    const lbl = document.createElement('span');
    lbl.classList.add('tooltip-label');
    lbl.textContent = label;

    const val = document.createElement('span');
    val.classList.add('tooltip-value');
    val.textContent = value;

    row.appendChild(lbl);
    row.appendChild(val);
    return row;
  }

  _mostrarTooltip(e, turno) {
    if (!this.tooltip) {
      this.tooltip = this._crearTooltip();
    }

    const body = this.tooltip.querySelector('.tooltip-body');
    body.innerHTML = '';

    const filas = [
      this._filaTooltip('Cliente',  this._nombrePersona(turno.cliente)),
      this._filaTooltip('Técnico',  this._nombrePersona(turno.tecnico)),
      this._filaTooltip('Inicio',   turno.hora_inicio?.slice(0, 5)),
      this._filaTooltip('Fin',      turno.hora_fin?.slice(0, 5)),
      this._filaTooltip('Estado',   turno.estado),
      this._filaTooltip('Ticket',   turno.numero_ticket ?? null),
    ];

    filas.forEach(f => f && body.appendChild(f));

    this.tooltip.style.display = 'block';
    this._posicionarTooltip(e);

    // Forzar reflow para que la transición funcione
    this.tooltip.offsetHeight;
    this.tooltip.classList.add('visible');
  }

  _posicionarTooltip(e) {
    if (!this.tooltip) return;
    const offset = 14;
    const tw = this.tooltip.offsetWidth;
    const th = this.tooltip.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let x = e.clientX + offset;
    let y = e.clientY + offset;

    // Evitar que se salga de la pantalla
    if (x + tw > vw - 8) x = e.clientX - tw - offset;
    if (y + th > vh - 8) y = e.clientY - th - offset;

    this.tooltip.style.left = `${x}px`;
    this.tooltip.style.top  = `${y}px`;
  }

  _ocultarTooltip() {
    if (!this.tooltip) return;
    this.tooltip.classList.remove('visible');
    // Esperar a que termine la transición para ocultar
    this.tooltip.addEventListener('transitionend', () => {
      if (this.tooltip && !this.tooltip.classList.contains('visible')) {
        this.tooltip.style.display = 'none';
      }
    }, { once: true });
  }

  /* ─────────────────────────────────────────────────────────────────
   * HELPERS
   * ───────────────────────────────────────────────────────────────── */
  _nombrePersona(p) {
    if (!p) return '';
    return [p.nombre, p.apellido].filter(Boolean).join(' ');
  }
}