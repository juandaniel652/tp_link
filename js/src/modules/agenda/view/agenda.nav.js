import { getFechaLunes } from '../utils/agenda.utils.js';

/* ─── helpers de estilos ──────────────────────────────────────────── */

function crearSelectBase() {
  const sel = document.createElement('select');
  Object.assign(sel.style, {
    padding:      '8px 14px',
    borderRadius: '12px',
    border:       'none',
    fontWeight:   'bold',
    fontSize:     '14px',
    color:        '#f0f0f0',
    background:   'linear-gradient(135deg, #1E3C72, #2A5298)',
    cursor:       'pointer',
    transition:   '0.3s'
  });
  return sel;
}

function crearBotonNavegar(texto, onClick) {
  const btn = document.createElement('button');
  btn.textContent = texto;
  Object.assign(btn.style, {
    padding:      '8px 14px',
    borderRadius: '12px',
    border:       'none',
    fontWeight:   'bold',
    fontSize:     '14px',
    cursor:       'pointer',
    background:   'linear-gradient(135deg, #2A5298, #1E3C72)',
    color:        '#ffffff'
  });
  btn.addEventListener('click', onClick);
  return btn;
}

/* ─── Vista de navegación ─────────────────────────────────────────── */

export class AgendaNavView {
  /**
   * @param {import('../controller/agenda.controller.js').AgendaController} ctrl
   */
  constructor(ctrl) {
    this.ctrl = ctrl;
  }

  render() {
    const nav = document.createElement('div');
    nav.appendChild(this._selectTecnico());
    nav.appendChild(this._selectSemana());
    nav.appendChild(this._selectRango());
    nav.appendChild(this._botones());
    return nav;
  }

  /* ── select técnico ── */
  _selectTecnico() {
    const select = crearSelectBase();
    select.id = 'selectTecnico';

    select.appendChild(new Option('Agenda Unificada', ''));
    (this.ctrl.state.tecnicos || []).forEach(t => {
      const nombre = `${t.nombre} ${t.apellido}`.trim();
      select.appendChild(new Option(nombre, nombre));
    });

    if (this.ctrl.state.tecnicoFiltro) {
      select.value = this.ctrl.state.tecnicoFiltro;
    }

    select.addEventListener('change', e => {
      this.ctrl.onTecnicoChange(e.target.value);
    });

    return select;
  }

  /* ── select semana ── */
  _selectSemana() {
    const select = crearSelectBase();
    select.id = 'selectSemana';
    const lunesActual = getFechaLunes(new Date());

    const fill = () => {
      select.innerHTML = '';
      const s = this.ctrl.state.semanaSeleccionada;

      const optActual = new Option('⏪ Semana Actual', 0);
      if (s === 0) optActual.selected = true;
      select.appendChild(optActual);

      for (let i = s - 4; i <= s + 4; i++) {
        if (i === 0) continue;
        const ini = new Date(lunesActual);
        ini.setDate(ini.getDate() + i * 7);
        const fin = new Date(ini);
        fin.setDate(fin.getDate() + 6);
        const opt = new Option(
          `Del ${ini.toLocaleDateString('es-ES')} al ${fin.toLocaleDateString('es-ES')}`,
          i
        );
        if (i === s) opt.selected = true;
        select.appendChild(opt);
      }
    };

    fill();

    select.addEventListener('change', e => {
      this.ctrl.onSemanaChange(parseInt(e.target.value));
    });

    return select;
  }

  /* ── select rango ── */
  _selectRango() {
    const select = crearSelectBase();
    select.id = 'selectRango';
    select.appendChild(new Option('Mañana (09:00 - 13:00)', 'AM'));
    select.appendChild(new Option('Tarde (14:00 - 18:00)', 'PM'));
    select.value = this.ctrl.state.rangoSeleccionado;

    select.addEventListener('change', e => {
      this.ctrl.onRangoChange(e.target.value);
    });

    return select;
  }

  /* ── botones prev / next ── */
  _botones() {
    const frag = document.createDocumentFragment();
    frag.appendChild(crearBotonNavegar('← Semana Anterior', () => this.ctrl.onSemanaAnterior()));
    frag.appendChild(crearBotonNavegar('Semana Siguiente →', () => this.ctrl.onSemanaSiguiente()));
    return frag;
  }
}