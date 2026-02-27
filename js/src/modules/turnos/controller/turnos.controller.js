import {
  obtenerTurnos,
  crearTurno,
  cancelarTurno
} from "../service/turnos.service.js";

import { extractTurnoParams } from "../service/andros.service.js";
import { TurnosState } from "../state/turnos.state.js";
import { obtenerDisponibilidad } from "../service/disponibilidad.service.js";

export class TurnosController {
  constructor({ view }) {
    this.view = view;
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
      this.view.setLoading(state.loading);
      this.view.renderError(state.error);
      this.view.renderTurnos(state.turnos);
    });
  }

  bindEvents() {
    this.view.onBuscarTurnos((fecha) =>
      this.handleBuscarTurnos(fecha)
    );

    this.view.onCrearTurno((turno) =>
      this.handleCrearTurno(turno)
    );

    this.view.onCancelarTurno((id) =>
      this.handleCancelarTurno(id)
    );
  }

  async handleBuscarTurnos(fecha) {
    this.state.setLoading(true);
    this.state.clearError();

    try {
      const turnos = await obtenerTurnos();
      this.state.update({
        fechaSeleccionada: fecha,
        turnos
      });
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
      const nuevoTurno = await crearTurno(turno);
      this.state.addTurno(nuevoTurno);
    } catch (error) {
      this.state.setError(error);
    } finally {
      this.state.setLoading(false);
    }
  }

  async handleCancelarTurno(id) {
    this.state.setLoading(true);
    this.state.clearError();

    try {
      const turnoActualizado = await cancelarTurno(id);
      this.state.replaceTurno(turnoActualizado);
    } catch (error) {
      this.state.setError(error);
    } finally {
      this.state.setLoading(false);
    }
  }

  async handleBuscarDisponibilidad({ tecnicoId, fecha }) {
    this.state.setLoading(true);
    this.state.clearError();

    try {
      const disponibilidad = await obtenerDisponibilidad({
        tecnicoId,
        fecha
      });

      this.view.renderDisponibilidad(disponibilidad);

    } catch (error) {
      this.state.setError(error);
    } finally {
      this.state.setLoading(false);
    }
  }
}