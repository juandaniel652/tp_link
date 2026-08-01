import { AgendaService }    from '../service/agenda.service.js';
import { obtenerClientes }  from '../../clientes/service/clientes.service.js';
import TecnicosService      from '../../tecnicos/service/tecnicos.service';
import { tokenStorage }     from '../../../core/storage/tokenStorage.js';
import { AgendaNavView }    from '../view/agenda.nav.js';
import { AgendaTableView }  from '../view/agenda.table.view.js';
import { getFechaLunes } from '../utils/agenda.utils.js';
import { ToastService } from "../../../ui/ToastService.js";

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
  constructor(containerId) {
    this.container = document.getElementById(containerId);

    /* servicios */
    this.service        = new AgendaService();



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
      fechaInicioSemana: getFechaLunes(new Date()),
      role: 'user'
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
      // 1. Detectar Rol
      const token = tokenStorage.getToken();
      try {
        const payload = JSON.parse(decodeURIComponent(escape(atob(token.split(".")[1]))));
        this.state.role = payload?.role || 'user';
      } catch (e) { this.state.role = 'user'; }

      // 2. Aplicar clase visual si no es admin
      if (this.state.role !== 'admin') {
          document.body.classList.add("user-readonly");
      }

      const [turnos, clientes, tecnicos] = await Promise.all([
        this.service.obtenerTodos(),
        obtenerClientes(tokenStorage.getToken()),
        TecnicosService.obtenerTodos()
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

  onAsignarTurno(fecha, horaInicioStr) {
    // BLOQUEO PARA USUARIOS
    if (this.state.role !== 'admin') {
      ToastService.info('Solo los administradores pueden asignar turnos desde la agenda.');
      return;
    }

    if (!this.state.tecnicoFiltro) {
      ToastService.info('Seleccione un técnico');
      return;
    }
    
    const params = new URLSearchParams({
      tecnico_id: this.state.tecnicoFiltro,
      fecha,
    });
    // Redirigir a turnos (esto se mantiene solo para admins)
    window.location.href = `./turno.html?${params.toString()}`;
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