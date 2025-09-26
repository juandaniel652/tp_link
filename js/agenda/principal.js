import { TurnoService } from '../agenda/turnoService.js';
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

  // 👇 Nuevo: refrescar solo el cuerpo de la tabla (cuando cambio de técnico)
  refrescarCuerpo() {
    this.turnos = this.turnoService.getAll();

    const table = this.container.querySelector('table');
    if (!table) return;

    // eliminar tbody anterior
    const oldTbody = table.querySelector('tbody');
    if (oldTbody) {
      oldTbody.remove();
    }

    // insertar tbody nuevo
    table.appendChild(this.ui.crearCuerpo());

    this.cargarClientesPorTecnico(this.tecnicoFiltro);
  }

  cargarClientesPorTecnico(tecnico) {
    const clientesSelect = document.getElementById('selectCliente');
    if (!clientesSelect) return;

    const clientes = this.clienteService.getAll();
    clientesSelect.innerHTML = '<option value="">Seleccionar Cliente</option>';

    let clientesFiltrados = clientes;

    if (tecnico) {
      // Filtrar clientes que tengan turno con el técnico seleccionado
      const clientesConTurno = this.turnos
        .filter(t => t.tecnico === tecnico)   // 👈 corregido: usamos string técnico
        .map(t => t.cliente);

      clientesFiltrados = clientes.filter(c => {
        const nombreCompleto = `${c.nombre} ${c.apellido}`;
        return clientesConTurno.includes(nombreCompleto);
      });
    }

    // Agregar opciones al select
    clientesFiltrados.forEach(c => {
      const nombreCompleto = `${c.nombre} ${c.apellido}`;
      const option = new Option(nombreCompleto, nombreCompleto);
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