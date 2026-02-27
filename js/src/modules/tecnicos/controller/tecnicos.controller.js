// js/src/modules/tecnicos/controller/tecnicos.controller.js
import {
  obtenerTecnicos,
  crearTecnico,
  actualizarTecnico,
  eliminarTecnico
} from "../service/tecnicos.service.js";

import { Tecnico } from "../model/tecnico.model.js";

import {
  crearDisponibilidad,
  eliminarDisponibilidad,
  obtenerDisponibilidad
} from "../../disponibilidad/service/disponibilidad.service.js";

import { Disponibilidad } from "../../disponibilidad/model/disponibilidad.model.js";

export class TecnicosController {

  constructor({ view, tokenProvider }) {
    this.view = view;
    this.tokenProvider = tokenProvider;
    this.tecnicos = [];
    this.editando = null;
  }

  async init() {
    this.bindEvents();
    await this.cargar();
  }

  bindEvents() {
    this.view.onSubmit(data => this.handleGuardar(data));
    this.view.onEdit(id => this.handleEditar(id));
    this.view.onDelete(id => this.handleEliminar(id));
  }

  async cargar() {
    try {
      const token = this.tokenProvider.getToken();
      this.tecnicos = await obtenerTecnicos(token);
      this.view.render(this.tecnicos);
    } catch (error) {
      this.view.showError(error.message);
    }
  }

  async handleGuardar(data) {
    try {
      const token = this.tokenProvider.getToken();

      const tecnico = new Tecnico({
        ...data,
        id: this.editando?.id ?? null,
        activo: true,
        horarios: [] // horarios se crean como agregado independiente
      });

      let tecnicoCreado;

      if (!this.editando) {
        tecnicoCreado = await crearTecnico(tecnico, token);
      } else {
        tecnicoCreado = await actualizarTecnico(tecnico, token);

        // eliminar disponibilidades previas antes de crear nuevas
        const prevDisps = await obtenerDisponibilidad(tecnicoCreado.id, token);
        await Promise.all(prevDisps.map(d => eliminarDisponibilidad(d.id, token)));

        this.editando = null;
      }

      // Crear disponibilidades del técnico en paralelo
      if (data.horarios && data.horarios.length) {
        await Promise.all(
          data.horarios.map(h => crearDisponibilidad(
            new Disponibilidad({
              tecnicoId: tecnicoCreado.id,
              diaSemana: h.dia_semana,
              horaInicio: h.hora_inicio,
              horaFin: h.hora_fin
            }),
            token
          ))
        );
      }

      this.view.resetForm();
      await this.cargar();

    } catch (error) {
      this.view.showError(error.message);
    }
  }

  async handleEditar(id) {
    const tecnico = this.tecnicos.find(t => t.id === id);
    if (!tecnico) return;

    this.editando = tecnico;

    try {
      const token = this.tokenProvider.getToken();
      const horarios = await obtenerDisponibilidad(tecnico.id, token);
      this.view.fillForm({ ...tecnico, horarios });
    } catch (error) {
      this.view.showError(error.message);
    }
  }

  async handleEliminar(id) {
    if (!confirm("¿Eliminar técnico?")) return;

    try {
      const token = this.tokenProvider.getToken();
      await eliminarTecnico(id, token);
      await this.cargar();
    } catch (error) {
      this.view.showError(error.message);
    }
  }
}