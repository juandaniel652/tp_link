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

  // 🔹 Refrescar solo el cuerpo de la tabla (cuando cambio de técnico)
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
      // Normalizamos nombres de técnicos y clientes en turnos
      const clientesConTurno = this.turnos
        .filter(t => {
          // 🔹 el técnico en los turnos puede ser string o un objeto
          if (typeof t.tecnico === "string") {
            return t.tecnico.trim() === tecnico.trim();
          } else if (t.tecnico?.nombre && t.tecnico?.apellido) {
            const nombreCompletoTec = `${t.tecnico.nombre} ${t.tecnico.apellido}`.trim();
            return nombreCompletoTec === tecnico.trim();
          }
          return false;
        })
        .map(t => {
          if (typeof t.cliente === "string") {
            return t.cliente.trim();
          } else if (t.cliente?.nombre && t.cliente?.apellido) {
            return `${t.cliente.nombre} ${t.cliente.apellido}`.trim();
          }
          return "";
        });

      clientesFiltrados = clientes.filter(c => {
        const nombreCompleto = `${c.nombre} ${c.apellido}`.trim();
        return clientesConTurno.includes(nombreCompleto);
      });
    }

    // Agregar opciones al select
    clientesFiltrados.forEach(c => {
      const nombreCompleto = `${c.nombre} ${c.apellido}`.trim();
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
