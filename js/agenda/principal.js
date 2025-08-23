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

    this.horaInicio = 8;
    this.horaFin = 17;
    this.minutosBloque = 15;
    this.numDias = 6;

    this.fechaInicioSemana = this.getFechaLunes(new Date());
    this.turnos = this.turnoService.getAll();
    this.tecnicoFiltro = ''; // '' = todos los técnicos
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
    this.turnos = this.turnoService.getAll(); // recarga turnos
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

  // --- Muestra todos los clientes siempre, y resalta los del técnico seleccionado ---
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
          option.style.color = '#1E90FF'; // azul
          option.style.fontWeight = 'bold';
        } else {
          option.style.color = '#bbb'; // tenue
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

    const selectTecnico = document.createElement('select');
    selectTecnico.id = 'selectTecnico';

    // Opción "Todos" siempre visible
    const opcionTodos = document.createElement('option');
    opcionTodos.value = ''; // valor vacío = todos
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
      this.tecnicoFiltro = e.target.value; // '' = todos
      this.cargarClientesPorTecnico(this.tecnicoFiltro);
      this.generarTabla();
    });

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
    nav.appendChild(btnPrev);
    nav.appendChild(btnNext);

    return nav;
  }
}
