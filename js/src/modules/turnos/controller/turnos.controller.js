import { obtenerTurnosPorFecha, crearTurno } from "../service/turnos.service.js";
import { extractTurnoParams } from "../service/andros.service.js";
import { TurnosState } from "../state/turnos.state.js";

export class TurnosController {
  constructor({ view, tokenProvider }) {
    this.view = view;
    this.tokenProvider = tokenProvider;
    this.state = new TurnosState();
  }

  async init() {
    this.bindState();
    this.bindEvents();

    const search = this.view.getSearchString();
    const params = extractTurnoParams(search);
    this.view.applyParamsToSelects(params);
  }

  bindState() {
    this.state.subscribe((state) => {
      this.view.renderTurnos(state.turnos);
      this.view.setLoading(state.loading);
      this.view.renderError(state.error);
    });
  }

  bindEvents() {
    this.view.onBuscarTurnos((fecha) =>
      this.handleBuscarTurnos(fecha)
    );

    this.view.onCrearTurno((turno) =>
      this.handleCrearTurno(turno)
    );
  }

  async handleBuscarTurnos(fecha) {
    this.state.setLoading(true);
    this.state.clearError();

    try {
      const token = this.tokenProvider.getToken();
      const turnos = await obtenerTurnosPorFecha({ fecha, token });

      this.state.setFecha(fecha);
      this.state.setTurnos(turnos);
    } catch (error) {
      this.state.setError(error);
    } finally {
      this.state.setLoading(false);
    }
  }

  async handleCrearTurno(turno) {
    this.state.setLoading(true);
    this.state.clearError();

    try {
      const token = this.tokenProvider.getToken();
      const nuevoTurno = await crearTurno({ turno, token });

      this.state.addTurno(nuevoTurno);
    } catch (error) {
      this.state.setError(error);
    } finally {
      this.state.setLoading(false);
    }
  }
}