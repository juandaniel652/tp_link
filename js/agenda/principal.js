import { TurnoService } from '../agenda/TurnoService.js';
import { ClienteService } from '../agenda/ClienteService.js';
import { TecnicoService } from './TecnicoService.js';
import { AgendaUI } from './AgendaUI.js';
import { AgendaNav } from './AgendaNav.js';
import { getFechaLunes, formatHora, pad } from './utils.js';

export class Agenda {
  constructor(containerId) {
    this.container = document.getElementById(containerId);

    this.turnoService = new TurnoService();
    this.clienteService = new ClienteService();
    this.tecnicoService = new TecnicoService();

    this.rangoSeleccionado = "AM";
    this.horaInicio = 9;
    this.horaFin = 13;
    this.minutosBloque = 15;
    this.numDias = 6;
    this.semanaSeleccionada = 0;
    this.tecnicoFiltro = '';
    this.fechaInicioSemana = getFechaLunes(new Date());
    this.turnos = this.turnoService.getAll();

    // helpers de utils
    this.formatHora = formatHora;
    this.pad = pad;

    this.nav = new AgendaNav(this);
    this.ui = new AgendaUI(this);

    this.generarTabla();
  }

  generarTabla() {
    this.turnos = this.turnoService.getAll();

    this.container.innerHTML = '';
    this.container.appendChild(this.nav.crearNavegacion());

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
      const option = new Option(nombreCompleto, nombreCompleto);

      if (tecnico) {
        const tieneTurno = this.turnos.some(
          t => t.cliente === nombreCompleto && t.tecnico === tecnico
        );
        option.style.color = tieneTurno ? '#1E90FF' : '#bbb';
        option.style.fontWeight = tieneTurno ? 'bold' : 'normal';
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
}
