import { TurnoService } from '../agenda/turnoService.js';
import { ClienteService } from '../service/clienteService.js';
import TecnicoService from '../tecnico/TecnicoService.js';
import { AgendaUI } from './AgendaUI.js';
import { AgendaNav } from './AgendaNav.js';
import { getFechaLunes, formatHora, pad } from './utils.js';

export class Agenda {
  constructor(containerId) {
    this.container = document.getElementById(containerId);

    // servicios conectados al backend
    this.turnoService = new TurnoService();
    this.clienteService = new ClienteService();
    this.tecnicoService = TecnicoService;

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
    this.initPromise = this.init();
  }

  async init() {

    try {

      console.log("ClienteService class:", ClienteService);
      console.log("TecnicoService class:", TecnicoService);

      this.turnos = await this.turnoService.obtenerTodos();

      this.clientes = await this.clienteService.obtenerTodos();

      this.tecnicos = await this.tecnicoService.obtenerTodos();

      // asegurar arrays
      this.turnos ??= [];
      this.clientes ??= [];
      this.tecnicos ??= [];

      this.generarTabla();

    }
    catch(e){

      console.error("Error cargando agenda:", e);

    }

  }

  async generarTabla() {

    await this.initPromise;

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

  async asignarTurno(fecha, horaInicioStr) {

    if (!this.tecnicoFiltro) {
      alert("Seleccione técnico");
      return;
    }

    const tecnicoObj = this.tecnicos.find(t =>
      `${t.nombre}` === this.tecnicoFiltro ||
      `${t.nombre} ${t.apellido ?? ""}`.trim() === this.tecnicoFiltro
    );

    if (!tecnicoObj) {
      alert("Técnico no encontrado");
      return;
    }

    const clienteNombre = prompt("Nombre cliente:");

    if (!clienteNombre) return;

    const clienteObj = this.clientes.find(c =>
      `${c.nombre}` === clienteNombre ||
      `${c.nombre} ${c.apellido ?? ""}`.trim() === clienteNombre
    );

    if (!clienteObj) {
      alert("Cliente no encontrado");
      return;
    }

    // calcular hora_fin (+15min)
    const [h, m] = horaInicioStr.split(":").map(Number);

    const dateTemp = new Date();
    dateTemp.setHours(h);
    dateTemp.setMinutes(m + this.minutosBloque);

    const horaFinStr =
      this.pad(dateTemp.getHours()) +
      ":" +
      this.pad(dateTemp.getMinutes()) +
      ":00";

    const turnoBackend = {

      cliente_id: clienteObj.id,

      tecnico_id: tecnicoObj.id,

      tipo_turno: 1,

      rango_horario: `${horaInicioStr} - ${horaFinStr}`,

      estado: "confirmado",

      fecha: fecha,

      hora_inicio: horaInicioStr + ":00",

      hora_fin: horaFinStr

    };

    try {

      await this.turnoService.crear(turnoBackend);

      await this.refrescarCuerpo();

    }
    catch(e){

      console.error(e);

      alert(e.message || "Error");

    }

  }

}
