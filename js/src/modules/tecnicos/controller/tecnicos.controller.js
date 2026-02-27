import {
  obtenerTecnicos,
  crearTecnico,
  actualizarTecnico,
  eliminarTecnico
} from "../service/tecnicos.service.js";

import { Tecnico } from "../model/tecnico.model.js";

import { crearDisponibilidad } from "../../disponibilidad/service/disponibilidad.service.js";
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
        activo: true
      });
    
      let tecnicoCreado;
    
      if (!this.editando) {
        tecnicoCreado = await crearTecnico(tecnico, token);
      } else {
        tecnicoCreado = await actualizarTecnico(tecnico, token);
        this.editando = null;
      }
    
      // Crear disponibilidades
      const horariosDesdeUI = this.view.getHorarios(); // suponiendo que llamamos a DisponibilidadView.recopilarHorarios()
      for (const h of horariosDesdeUI) {
        await crearDisponibilidad(
          new Disponibilidad({
            tecnicoId: tecnicoCreado.id,
            diaSemana: h.diaSemana,
            horaInicio: h.horaInicio,
            horaFin: h.horaFin
          }),
          token
        );
      }
    
      this.view.resetForm();
      await this.cargar();
    } catch (error) {
      this.view.showError(error.message);
    }
  }

  handleEditar(id) {
    const tecnico = this.tecnicos.find(t => t.id === id);
    if (!tecnico) return;

    this.editando = tecnico;
    // Podés extender luego con fillForm()
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