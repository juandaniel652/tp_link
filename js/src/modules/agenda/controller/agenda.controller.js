import { AgendaService }    from '../service/agenda.service.js';
import { AgendaNavView }    from '../view/agenda.nav.view.js';
import { AgendaTableView }  from '../view/agenda.table.view.js';
import { getFechaLunes, pad } from '../utils/agenda.utils.js';

/**
 * Controlador del módulo Agenda.
 *
 * Responsabilidades:
 *  - Mantener el estado reactivo (semana, rango, técnico, listas de datos).
 *  - Orquestar llamadas al servicio.
 *  - Delegar el renderizado a las vistas.
 *  - Exponer handlers que las vistas pueden invocar directamente.
 */
export class AgendaController {
  /**
   * @param {string} containerId  - id del div donde se monta la agenda
   * @param {{ clienteService: Object, tecnicoService: Object }} deps
   */
  constructor(containerId, { clienteService, tecnicoService }) {
    this.container = document.getElementById(containerId);

    /* servicios */
    this.service        = new AgendaService();
    this.clienteService = clienteService;
    this.tecnicoService = tecnicoService;

    /* estado */
    this.state = {
      turnos:            [],
      clientes:          [],
      tecnicos:          [],
      rangoSeleccionado: 'AM',
      horaInicio:        9,
      horaFin:           13,
      minutosBloque:     15,
      numDias:           6,
      semanaSeleccionada: 0,
      tecnicoFiltro:     '',
      fechaInicioSemana: getFechaLunes(new Date())
    };

    /* vistas */
    this.navView   = new AgendaNavView(this);
    this.tableView = new AgendaTableView(this);

    /* arranque */
    this._initPromise = this._init();
  }

  /* ─────────────────────────────────────────────────────────────────
   * INICIALIZACIÓN
   * ───────────────────────────────────────────────────────────────── */
  async _init() {
    try {
      const [turnos, clientes, tecnicos] = await Promise.all([
        this.service.obtenerTodos(),
        this.clienteService.obtenerTodos(),
        this.tecnicoService.obtenerTodos()
      ]);

      this.state.turnos   = turnos   ?? [];
      this.state.clientes = clientes ?? [];
      this.state.tecnicos = tecnicos ?? [];

      this._render();
    } catch (e) {
      console.error('[AgendaController] Error en init:', e);
    }
  }

  /* ─────────────────────────────────────────────────────────────────
   * RENDER
   * ───────────────────────────────────────────────────────────────── */
  _render() {
    this.tableView.render(this.container);
    this._actualizarSelectClientes();
  }

  async _refrescarCuerpo() {
    this.state.turnos = await this.service.obtenerTodos();
    this.tableView.refrescarCuerpo(this.container);
    this._actualizarSelectClientes();
  }

  /* ─────────────────────────────────────────────────────────────────
   * HANDLERS PÚBLICOS (llamados por las vistas)
   * ───────────────────────────────────────────────────────────────── */
  onTecnicoChange(valor) {
    this.state.tecnicoFiltro = valor;
    this._refrescarCuerpo();
  }

  onSemanaChange(offset) {
    const lunes = getFechaLunes(new Date());
    lunes.setDate(lunes.getDate() + offset * 7);
    this.state.semanaSeleccionada = offset;
    this.state.fechaInicioSemana  = lunes;
    this._render();
  }

  onRangoChange(rango) {
    this.state.rangoSeleccionado = rango;
    this.state.horaInicio        = rango === 'AM' ? 9  : 14;
    this.state.horaFin           = rango === 'AM' ? 13 : 18;
    this._render();
  }

  onSemanaAnterior() {
    this.state.semanaSeleccionada--;
    this.state.fechaInicioSemana.setDate(
      this.state.fechaInicioSemana.getDate() - 7
    );
    this._render();
  }

  onSemanaSiguiente() {
    this.state.semanaSeleccionada++;
    this.state.fechaInicioSemana.setDate(
      this.state.fechaInicioSemana.getDate() + 7
    );
    this._render();
  }

  async onAsignarTurno(fecha, horaInicioStr) {
    if (!this.state.tecnicoFiltro) {
      alert('Seleccione un técnico');
      return;
    }

    const tecnicoObj = this.state.tecnicos.find(t =>
      `${t.nombre} ${t.apellido ?? ''}`.trim() === this.state.tecnicoFiltro
    );

    if (!tecnicoObj) {
      alert('Técnico no encontrado');
      return;
    }

    const clienteNombre = prompt('Nombre cliente:');
    if (!clienteNombre) return;

    const clienteObj = this.state.clientes.find(c =>
      `${c.nombre} ${c.apellido ?? ''}`.trim() === clienteNombre
    );

    if (!clienteObj) {
      alert('Cliente no encontrado');
      return;
    }

    const [h, m]    = horaInicioStr.split(':').map(Number);
    const tmp       = new Date();
    tmp.setHours(h);
    tmp.setMinutes(m + this.state.minutosBloque);
    const horaFinStr = `${pad(tmp.getHours())}:${pad(tmp.getMinutes())}:00`;

    try {
      await this.service.crear({
        cliente_id:    clienteObj.id,
        tecnico_id:    tecnicoObj.id,
        tipo_turno:    1,
        rango_horario: `${horaInicioStr} - ${horaFinStr}`,
        estado:        'confirmado',
        fecha,
        hora_inicio:   horaInicioStr + ':00',
        hora_fin:      horaFinStr
      });

      await this._refrescarCuerpo();
    } catch (e) {
      console.error(e);
      alert(e.message || 'Error al asignar turno');
    }
  }

  /* ─────────────────────────────────────────────────────────────────
   * SELECT CLIENTES EXTERNO
   * ───────────────────────────────────────────────────────────────── */
  _actualizarSelectClientes() {
    const sel = document.getElementById('selectCliente');
    if (!sel) return;

    sel.innerHTML = '<option value="">Seleccionar Cliente</option>';

    const filtrados = this.service.filtrarClientesPorTecnico(
      this.state.clientes,
      this.state.turnos,
      this.state.tecnicoFiltro
    );

    filtrados.forEach(c => {
      const nombre = `${c.nombre} ${c.apellido}`.trim();
      sel.appendChild(new Option(nombre, nombre));
    });
  }
}