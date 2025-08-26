import { TurnoService } from '../agenda/TurnoService.js';
import { ClienteService } from '../agenda/ClienteService.js';
import { TecnicoService } from './TecnicoService.js';
import { AgendaUI } from './AgendaUI.js';

export class Agenda {
  constructor(containerId) {
    this.container = document.getElementById(containerId);

    this.turnoService = new TurnoService();
    this.clienteService = new ClienteService();
    this.tecnicoService = new TecnicoService();

    // Valores iniciales según rango AM
    this.rangoSeleccionado = "AM";  // rango por defecto
    this.horaInicio = 9;            // inicio AM
    this.horaFin = 13;              // fin AM
    this.minutosBloque = 15;
    this.numDias = 6;

    this.fechaInicioSemana = this.getFechaLunes(new Date());
    this.turnos = this.turnoService.getAll();
    this.tecnicoFiltro = ''; 
    this.semanaSeleccionada = 0;

    this.ui = new AgendaUI(this);

    console.log('Agenda inicializada');
    console.log('Turnos iniciales:', this.turnos);
    console.log('Técnicos iniciales:', this.tecnicoService.getAll());
    console.log('Técnico filtro inicial:', this.tecnicoFiltro);

    this.generarTabla();
  }

  getFechaLunes(fecha) {
    const dia = fecha.getDay();
    const diff = (dia === 0 ? -6 : 1) - dia;
    const lunes = new Date(fecha);
    lunes.setDate(fecha.getDate() + diff);
    lunes.setHours(0,0,0,0);
    return lunes;
  }

  formatHora(h, m) {
    return `${this.pad(h)}:${this.pad(m % 60)}`;
  }

  pad(n) {
    return n.toString().padStart(2, '0');
  }

  generarTabla() {
    this.turnos = this.turnoService.getAll(); 
    console.log('--- Generando tabla ---');
    console.log('Turnos actuales:', this.turnos);

    this.container.innerHTML = '';
    const nav = this.crearNavegacion();
    this.container.appendChild(nav);

    const table = document.createElement('table');
    table.appendChild(this.ui.crearEncabezado());
    table.appendChild(this.ui.crearCuerpo());
    this.container.appendChild(table);

    this.cargarClientesPorTecnico(this.tecnicoFiltro);
  }

  cargarClientesPorTecnico(tecnico) {
    const clientesSelect = document.getElementById('selectCliente');
    if (!clientesSelect) return;

    const clientes = this.clienteService.getAll();
    clientesSelect.innerHTML = '<option value="">Seleccionar Cliente</option>';

    clientes.forEach(c => {
      const nombreCompleto = `${c.nombre} ${c.apellido}`;
      const option = document.createElement('option');
      option.value = nombreCompleto;
      option.textContent = nombreCompleto;

      if (tecnico) {
        const tieneTurno = this.turnos.some(
          t => t.cliente === nombreCompleto && t.tecnico === tecnico
        );
        if (tieneTurno) {
          option.style.color = '#1E90FF';
          option.style.fontWeight = 'bold';
        } else {
          option.style.color = '#bbb';
          option.style.fontWeight = 'normal';
        }
      } else {
        option.style.color = '#fff';
        option.style.fontWeight = 'normal';
      }

      clientesSelect.appendChild(option);
    });
  }

  asignarTurno(fStr, hStr) {
    if (!this.tecnicoFiltro) {
      alert('Debe seleccionar un técnico');
      return;
    }

    localStorage.setItem('nuevoTurno', JSON.stringify({
      fecha: fStr,
      hora: hStr,
      tecnico: this.tecnicoFiltro
    }));

    window.location.href = '../html/turno.html';
  }

  crearNavegacion() {
    const nav = document.createElement('div');

    // --- Select de técnicos ---
    const selectTecnico = document.createElement('select');
    selectTecnico.id = 'selectTecnico';

    const opcionTodos = document.createElement('option');
    opcionTodos.value = '';
    opcionTodos.textContent = 'Seleccionar Técnico';
    selectTecnico.appendChild(opcionTodos);

    this.tecnicoService.getAll().forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.nombre;
      opt.textContent = t.nombre;
      selectTecnico.appendChild(opt);
    });

    selectTecnico.value = this.tecnicoFiltro || '';
    selectTecnico.addEventListener('change', e => {
      this.tecnicoFiltro = e.target.value;
      this.cargarClientesPorTecnico(this.tecnicoFiltro);
      this.generarTabla();
    });

    // --- Select de semanas ---
    const selectSemana = document.createElement('select');
    selectSemana.id = 'selectSemana';
    const lunesActual = this.getFechaLunes(new Date());

    const renderSemanas = () => {
      selectSemana.innerHTML = '';
      if (this.semanaSeleccionada !== 0) {
        const optActual = document.createElement('option');
        optActual.value = 0;
        optActual.textContent = 'Esta semana';
        selectSemana.appendChild(optActual);
      }
      for (let i = this.semanaSeleccionada - 4; i <= this.semanaSeleccionada + 4; i++) {
        const fecha = new Date(lunesActual);
        fecha.setDate(fecha.getDate() + i*7);
        const fechaFin = new Date(fecha);
        fechaFin.setDate(fecha.getDate() + 6);

        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `Del ${fecha.toLocaleDateString('es-ES')} al ${fechaFin.toLocaleDateString('es-ES')}`;
        if (i === this.semanaSeleccionada) opt.selected = true;
        selectSemana.appendChild(opt);
      }
    };
    renderSemanas();
    selectSemana.addEventListener('change', e => {
      this.semanaSeleccionada = parseInt(e.target.value);
      const fecha = this.getFechaLunes(new Date());
      fecha.setDate(fecha.getDate() + this.semanaSeleccionada*7);
      this.fechaInicioSemana = fecha;
      this.generarTabla();
    });

    // --- Select de rango AM/PM ---
    const selectRango = document.createElement('select');
    selectRango.id = 'selectRango';

    const optAM = document.createElement('option');
    optAM.value = 'AM';
    optAM.textContent = 'Mañana (09:00 - 13:00)';
    selectRango.appendChild(optAM);

    const optPM = document.createElement('option');
    optPM.value = 'PM';
    optPM.textContent = 'Tarde (14:00 - 18:00)';
    selectRango.appendChild(optPM);

    selectRango.value = this.rangoSeleccionado;
    selectRango.addEventListener('change', e => {
      this.rangoSeleccionado = e.target.value;

      if (this.rangoSeleccionado === "AM") {
        this.horaInicio = 9;
        this.horaFin = 13;
      } else {
        this.horaInicio = 14;
        this.horaFin = 18;
      }

      this.generarTabla();
    });

    // --- Botones de navegación ---
    const btnPrev = document.createElement('button');
    btnPrev.textContent = '← Semana Anterior';
    btnPrev.onclick = () => {
      this.semanaSeleccionada -= 1;
      this.fechaInicioSemana.setDate(this.fechaInicioSemana.getDate() - 7);
      this.generarTabla();
    };

    const btnNext = document.createElement('button');
    btnNext.textContent = 'Semana Siguiente →';
    btnNext.onclick = () => {
      this.semanaSeleccionada += 1;
      this.fechaInicioSemana.setDate(this.fechaInicioSemana.getDate() + 7);
      this.generarTabla();
    };

    nav.appendChild(selectTecnico);
    nav.appendChild(selectSemana);
    nav.appendChild(selectRango);
    nav.appendChild(btnPrev);
    nav.appendChild(btnNext);

    return nav;
  }
}
