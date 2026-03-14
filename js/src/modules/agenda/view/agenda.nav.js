import { getFechaLunes } from '../utils/agenda.utils.js';

function crearSelectBase() {
  const sel = document.createElement('select');
  sel.className = 'agenda-select';
  return sel;
}

function crearBotonNavegar(texto, onClick) {
  const btn = document.createElement('button');
  btn.textContent = texto;
  btn.className = 'agenda-btn-nav';
  btn.addEventListener('click', onClick);
  return btn;
}

export class AgendaNavView {
  constructor(ctrl) {
    this.ctrl = ctrl;
  }

  render() {
    const nav = document.createElement('div');
    nav.className = 'agenda-nav';

    // Fila 1 — selects
    const filaSelects = document.createElement('div');
    filaSelects.className = 'agenda-nav-selects';
    filaSelects.appendChild(this._selectTecnico());
    filaSelects.appendChild(this._selectSemana());
    filaSelects.appendChild(this._selectRango());

    // Fila 2 — botones
    const filaBotones = document.createElement('div');
    filaBotones.className = 'agenda-nav-botones';
    filaBotones.appendChild(crearBotonNavegar('← Semana Anterior', () => this.ctrl.onSemanaAnterior()));
    filaBotones.appendChild(crearBotonNavegar('Semana Siguiente →', () => this.ctrl.onSemanaSiguiente()));

    nav.appendChild(filaSelects);
    nav.appendChild(filaBotones);
    return nav;
  }

  _selectTecnico() {
    const select = crearSelectBase();
    select.id = 'selectTecnico';
    select.appendChild(new Option('Agenda Unificada', ''));
    (this.ctrl.state.tecnicos || []).forEach(t => {
      const nombre = [t.nombre, t.apellido].filter(Boolean).join(' ');
      select.appendChild(new Option(nombre, t.id));
    });
    if (this.ctrl.state.tecnicoFiltro) select.value = this.ctrl.state.tecnicoFiltro;
    select.addEventListener('change', e => this.ctrl.onTecnicoChange(e.target.value));
    return select;
  }

  _selectSemana() {
    const select = crearSelectBase();
    select.id = 'selectSemana';
    const lunesActual = getFechaLunes(new Date());

    const fill = () => {
      select.innerHTML = '';
      const s = this.ctrl.state.semanaSeleccionada;
      const optActual = new Option('Semana Actual', 0);
      if (s === 0) optActual.selected = true;
      select.appendChild(optActual);
      for (let i = s - 4; i <= s + 4; i++) {
        if (i === 0) continue;
        const ini = new Date(lunesActual);
        ini.setDate(ini.getDate() + i * 7);
        const fin = new Date(ini);
        fin.setDate(fin.getDate() + 6);
        const opt = new Option(
          `Del ${ini.toLocaleDateString('es-ES')} al ${fin.toLocaleDateString('es-ES')}`, i
        );
        if (i === s) opt.selected = true;
        select.appendChild(opt);
      }
    };

    fill();
    select.addEventListener('change', e => this.ctrl.onSemanaChange(parseInt(e.target.value)));
    return select;
  }

  _selectRango() {
    const select = crearSelectBase();
    select.id = 'selectRango';
    select.appendChild(new Option('Mañana (09:00 - 13:00)', 'AM'));
    select.appendChild(new Option('Tarde (14:00 - 18:00)', 'PM'));
    select.value = this.ctrl.state.rangoSeleccionado;
    select.addEventListener('change', e => this.ctrl.onRangoChange(e.target.value));
    return select;
  }
}