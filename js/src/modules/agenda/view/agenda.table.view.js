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
            `${t.tecnico?.nombre} ${t.tecnico?.apellido}`.trim() === tecnicoFiltro
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
    btn.style.backgroundColor = turno.color || '#1E90FF';

    btn.addEventListener('mouseenter', () => {
      const contenido = `
        <strong>Cliente:</strong> ${this._nombrePersona(turno.cliente)}<br>
        <strong>Técnico:</strong> ${this._nombrePersona(turno.tecnico)}<br>
        <strong>Inicio:</strong>  ${turno.hora_inicio}<br>
        <strong>Fin:</strong>     ${turno.hora_fin}<br>
        <strong>Estado:</strong>  ${turno.estado}
      `;
      this._mostrarTooltip(btn, contenido);
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
   * TOOLTIP
   * ───────────────────────────────────────────────────────────────── */
  _mostrarTooltip(btn, contenido) {
    if (!this.tooltip) {
      this.tooltip = document.createElement('div');
      this.tooltip.classList.add('tooltip');
      document.body.appendChild(this.tooltip);
    }

    this.tooltip.innerHTML      = contenido;
    this.tooltip.style.display  = 'block';

    const move = (e) => {
      this.tooltip.style.top  = e.pageY + 15 + 'px';
      this.tooltip.style.left = e.pageX + 15 + 'px';
    };

    btn.addEventListener('mousemove', move);
    btn.addEventListener('mouseleave', () => {
      this.tooltip.style.display = 'none';
      btn.removeEventListener('mousemove', move);
    });
  }

  /* ─────────────────────────────────────────────────────────────────
   * HELPERS
   * ───────────────────────────────────────────────────────────────── */
  _nombrePersona(p) {
    if (!p) return '';
    return `${p.nombre ?? ''} ${p.apellido ?? ''}`.trim();
  }
}