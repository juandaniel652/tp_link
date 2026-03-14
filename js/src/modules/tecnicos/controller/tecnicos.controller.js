// modules/tecnicos/controller/tecnicos.controller.js
import { ToastService } from "@/ui/ToastService.js";
import TecnicosService from "../service/tecnicos.service.js";
import TecnicosView    from "../view/tecnicos.view.js";
import Tecnico         from "../model/tecnico.model.js";

export default class TecnicosController {

  constructor(formSelector, tableBodySelector) {
    this.service = TecnicosService;
    this.view    = new TecnicosView(formSelector, tableBodySelector);

    // Conectar callbacks de la vista con la lógica del controlador
    this.view.onGuardar  = payload => this._guardar(payload);
    this.view.onEliminar = id      => this._eliminar(id);
    this.view.onCancelar = ()      => {};   // ya manejado en la vista
  }

  // ── Ciclo de vida ────────────────────────────────────────────────────────────

  async init() {
    await this._cargarTabla();
  }

  // ── Handlers privados ────────────────────────────────────────────────────────

  async _guardar(payload) {
    console.log("GUARDAR payload:", payload);
    console.log("_validar:", this._validar(payload));
    // Validación básica antes de ir al servidor
    if (!this._validar(payload)) return;

    try {
      if (payload.id !== undefined) {
        await this.service.actualizar(payload.id, payload);
      } else {
        await this.service.crear(payload);
      }

      this.view.resetFormulario();
      await this._cargarTabla();

    } catch (err) {
      console.error("Error al guardar técnico:", err);
      ToastService.error("Error al guardar. Revisá la consola.");
    }
  }

  async _eliminar(id) {
    // confirm nativo reemplazado por toast de confirmación
    // Si querés un confirm visual, avisame y lo implementamos
    // Por ahora mantenemos confirm() ya que ToastService no tiene confirm
    if (!confirm("¿Eliminar técnico?")) return;
  
    try {
      await this.service.eliminar(id);
      ToastService.success("Técnico eliminado");
      await this._cargarTabla();
    
    } catch (err) {
      console.error("Error al eliminar técnico:", err);
      ToastService.error("Error al eliminar técnico.");
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  async _cargarTabla() {
    try {
      const tecnicos = await this.service.obtenerTodos();
      this.view.renderTabla(tecnicos);
    } catch (err) {
      ToastService.error("Error al cargar la lista de técnicos.");
    }
  }

  _validar(payload) {
    this.view.limpiarErrores();

    const campos = ["nombre", "apellido", "telefono", "email"];
    let valido = true;

    campos.forEach(campo => {
      const error = Tecnico.validarCampo(campo, payload[campo]);
      if (error) {
        this.view.mostrarError(campo, error);
        valido = false;
      }
    });

    const errorDuracion = Tecnico.validarCampo("duracionTurnoMinutos", payload.duracion_turno_min);
    if (errorDuracion) {
      this.view.mostrarError("duracionTurnoMinutos", errorDuracion);
      valido = false;
    }

    return valido;
  }
}