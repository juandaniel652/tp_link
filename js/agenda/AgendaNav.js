import { crearSelectBase, crearBotonNavegar } from '../agenda/ui.js';
import { getFechaLunes } from '../agenda/utils.js';

export class AgendaNav {
  constructor(agenda) {
    this.agenda = agenda;
  }

  crearNavegacion() {
    const nav = document.createElement('div');

    nav.appendChild(this.crearSelectTecnico());
    nav.appendChild(this.crearSelectSemana());
    nav.appendChild(this.crearSelectRango());
    nav.appendChild(this.crearBotones());

    return nav;
  }

  crearSelectTecnico() {
    const select = crearSelectBase();
    select.id = 'selectTecnico';

    select.appendChild(new Option('Seleccionar Técnico', ''));

    this.agenda.tecnicoService.getAll().forEach(t => {
      select.appendChild(new Option(t.nombre, t.nombre));
    });

    select.value = this.agenda.tecnicoFiltro;
    select.addEventListener('change', e => {
      this.agenda.tecnicoFiltro = e.target.value;
      this.agenda.cargarClientesPorTecnico(this.agenda.tecnicoFiltro);
      this.agenda.generarTabla();
    });

    return select;
  }

  crearSelectSemana() {
    const select = crearSelectBase();
    select.id = 'selectSemana';
    const lunesActual = getFechaLunes(new Date());

    const renderSemanas = () => {
      select.innerHTML = '';
      // Opción para volver rápido a la semana actual
      const optActual = new Option('⏪ Semana Actual', 0);
      if (this.agenda.semanaSeleccionada === 0) optActual.selected = true;
      select.appendChild(optActual);

      for (let i = this.agenda.semanaSeleccionada - 4; i <= this.agenda.semanaSeleccionada + 4; i++) {
        // Evitar duplicar la opción de semana actual
        if (i === 0) continue;
        const fecha = new Date(lunesActual);
        fecha.setDate(fecha.getDate() + i*7);
        const fechaFin = new Date(fecha);
        fechaFin.setDate(fecha.getDate() + 6);

        const opt = new Option(
          `Del ${fecha.toLocaleDateString('es-ES')} al ${fechaFin.toLocaleDateString('es-ES')}`,
          i
        );
        if (i === this.agenda.semanaSeleccionada) opt.selected = true;
        select.appendChild(opt);
      }
    };

    renderSemanas();

    select.addEventListener('change', e => {
      this.agenda.semanaSeleccionada = parseInt(e.target.value);
      const fecha = getFechaLunes(new Date());
      fecha.setDate(fecha.getDate() + this.agenda.semanaSeleccionada*7);
      this.agenda.fechaInicioSemana = fecha;
      this.agenda.generarTabla();
    });

    return select;
  }

  crearSelectRango() {
    const select = crearSelectBase();
    select.id = 'selectRango';

    select.appendChild(new Option('Mañana (09:00 - 13:00)', 'AM'));
    select.appendChild(new Option('Tarde (14:00 - 18:00)', 'PM'));

    select.value = this.agenda.rangoSeleccionado;
    select.addEventListener('change', e => {
      this.agenda.rangoSeleccionado = e.target.value;
      this.agenda.horaInicio = e.target.value === 'AM' ? 9 : 14;
      this.agenda.horaFin = e.target.value === 'AM' ? 13 : 18;
      this.agenda.generarTabla();
    });

    return select;
  }

  crearBotones() {
    const fragment = document.createDocumentFragment();

    const btnPrev = crearBotonNavegar('← Semana Anterior', () => {
      this.agenda.semanaSeleccionada--;
      this.agenda.fechaInicioSemana.setDate(this.agenda.fechaInicioSemana.getDate() - 7);
      this.agenda.generarTabla();
    });

    const btnNext = crearBotonNavegar('Semana Siguiente →', () => {
      this.agenda.semanaSeleccionada++;
      this.agenda.fechaInicioSemana.setDate(this.agenda.fechaInicioSemana.getDate() + 7);
      this.agenda.generarTabla();
    });

    fragment.appendChild(btnPrev);
    fragment.appendChild(btnNext);

    return fragment;
  }
}
