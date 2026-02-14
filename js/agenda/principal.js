import { TurnoService } from '../agenda/TurnoService.js';
import { ClienteService } from '../service/ClienteService.js';
import { TecnicoService } from './TecnicoService.js';
import { AgendaUI } from './AgendaUI.js';
import { AgendaNav } from './AgendaNav.js';
import { getFechaLunes, formatHora, pad } from './utils.js';

export class Agenda {
  constructor(containerId) {
    this.container = document.getElementById(containerId);

    // servicios conectados al backend
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

    // helpers de utils
    this.formatHora = formatHora;
    this.pad = pad;

    this.nav = new AgendaNav(this);
    this.ui = new AgendaUI(this);

    // 🔹 inicialización async
    this.init();
  }

  async init() {
    // Traer datos desde el backend
    this.turnos = await this.turnoService.obtenerTodos();
    this.clientes = await this.clienteService.obtenerTodos();
    this.tecnicos = await this.tecnicoService.obtenerTodos();

    // Generar tabla
    this.generarTabla();
  }

  generarTabla() {
    this.container.innerHTML = '';
    this.container.appendChild(this.nav.crearNavegacion());

    const table = document.createElement('table');
    table.appendChild(this.ui.crearEncabezado());
    table.appendChild(this.ui.crearCuerpo());
    this.container.appendChild(table);

    this.cargarClientesPorTecnico(this.tecnicoFiltro);
  }

  async refrescarCuerpo() {
    this.turnos = await this.turnoService.obtenerTodos();

    const table = this.container.querySelector('table');
    if (!table) return;

    const oldTbody = table.querySelector('tbody');
    if (oldTbody) oldTbody.remove();

    table.appendChild(this.ui.crearCuerpo());

    this.cargarClientesPorTecnico(this.tecnicoFiltro);
  }

  cargarClientesPorTecnico(tecnico) {
    const clientesSelect = document.getElementById('selectCliente');
    if (!clientesSelect) return;

    clientesSelect.innerHTML = '<option value="">Seleccionar Cliente</option>';

    let clientesFiltrados = this.clientes;

    if (tecnico) {
      const clientesConTurno = this.turnos
        .filter(t => {
          if (typeof t.tecnico === "string") return t.tecnico.trim() === tecnico.trim();
          else if (t.tecnico?.nombre && t.tecnico?.apellido) return `${t.tecnico.nombre} ${t.tecnico.apellido}`.trim() === tecnico.trim();
          return false;
        })
        .map(t => typeof t.cliente === "string" ? t.cliente.trim() : `${t.cliente.nombre} ${t.cliente.apellido}`.trim());

      clientesFiltrados = this.clientes.filter(c => {
        const nombreCompleto = `${c.nombre} ${c.apellido}`.trim();
        return clientesConTurno.includes(nombreCompleto);
      });
    }

    clientesFiltrados.forEach(c => {
      const nombreCompleto = `${c.nombre} ${c.apellido}`.trim();
      const option = new Option(nombreCompleto, nombreCompleto);
      clientesSelect.appendChild(option);
    });
  }

  async asignarTurno(fStr, hStr) {
    if (!this.tecnicoFiltro) {
      alert('Debe seleccionar un técnico');
      return;
    }
  
    // 🔹 Seleccionar cliente
    const clienteNombre = prompt(
      'Seleccione cliente para el turno:',
      this.clientes.length ? `${this.clientes[0].nombre} ${this.clientes[0].apellido}` : ''
    );
  
    if (!clienteNombre) return; // usuario canceló
  
    // Buscar cliente en la lista para obtener id real (si es que tu backend lo requiere)
    const clienteSeleccionado = this.clientes.find(c => `${c.nombre} ${c.apellido}`.trim() === clienteNombre.trim());
    if (!clienteSeleccionado) {
      alert('Cliente no encontrado');
      return;
    }
  
    // 🔹 Construir objeto turno
    const turnoNuevo = {
      fecha: fStr,
      hora: hStr,
      tecnico: this.tecnicoFiltro,
      cliente: clienteSeleccionado.nombre + ' ' + clienteSeleccionado.apellido,
      t: 1, // cantidad de bloques (puede ajustarse)
      rango: `${hStr} - ${this.formatHora(parseInt(hStr.split(':')[0]), parseInt(hStr.split(':')[1]) + 15)}`,
      estadoTicket: 'Confirmado', // inicial
      color: '#1E90FF' // opcional
    };
  
    try {
      // 🔹 Crear turno en backend
      await this.turnoService.crear(turnoNuevo);
    
      // 🔹 Refrescar tabla con el nuevo turno
      await this.refrescarCuerpo();
    
      alert('Turno creado correctamente!');
    } catch (err) {
      console.error('Error al crear turno:', err);
      alert('No se pudo crear el turno.');
    }
  }

}
