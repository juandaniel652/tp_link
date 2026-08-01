// modules/tecnicos/controller/tecnicos.controller.js
import { ToastService } from "../../../ui/ToastService.js";
import { tokenStorage } from "../../../core/storage/tokenStorage.js"; // Importamos el storage
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
    // 1. Verificar Seguridad antes de mostrar nada
    this._aplicarSeguridadSegunRol();

    // 2. Cargar datos
    await this._cargarTabla();
  }

  // ── Seguridad ────────────────────────────────────────────────────────────────

  _aplicarSeguridadSegunRol() {
    const role = this._getRole();

    if (role !== 'admin') {
      console.log("[TecnicosController] Aplicando modo lectura");
      
      const formElement = document.querySelector(this.view.formSelector);
      if (formElement) {
        // Buscamos el div .box que lo envuelve para que no quede el hueco blanco
        const container = formElement.closest('.box') || formElement;
        container.style.setProperty('display', 'none', 'important');
      }
      
      // Reforzamos la clase en el body
      document.body.classList.add("user-readonly");
    }
  }

  // ── Handlers privados ────────────────────────────────────────────────────────

  async _guardar(payload) {
    if (this._getRole() !== 'admin') {
        ToastService.error("No tenés permisos para realizar esta acción.");
        return;
    }

    if (!this._validar(payload)) return;

    try {
        if (payload.id !== undefined) {
            await this.service.actualizar(payload.id, payload);
            ToastService.success("Técnico actualizado");
        } else {
            await this.service.crear(payload);
            ToastService.success("Técnico creado");
        }

        this.view.resetFormulario();
        await this._cargarTabla();

    } catch (err) {
        console.error("Error al guardar técnico:", err);
        
        // --- LÓGICA SENIOR ADENTRO DEL CATCH ---
        if (err.message?.includes("no encontrado") || err.status === 404) {
            ToastService.error("El técnico ya no existe. Refrescando lista...");
            this.view.resetFormulario();
            await this._cargarTabla();
        } else {
            ToastService.error("Error al guardar. Revisá la consola.");
        }
    }
}

  async _eliminar(id) {
      if (this._getRole() !== 'admin') return;
  
      const confirmado = await ToastService.confirm({
          title: "¿Eliminar técnico?",
          message: "Esta acción no se puede deshacer.",
          confirmText: "Sí, eliminar",
          cancelText: "Cancelar",
          type: "danger",
      });
    
      if (!confirmado) return;
    
      try {
          await this.service.eliminar(id);
          ToastService.success("Técnico eliminado");
          await this._cargarTabla();
      } catch (err) {
          console.error("Error al eliminar técnico:", err);
          
          // --- LÓGICA SENIOR ADENTRO DEL CATCH ---
          if (err.message?.includes("no encontrado") || err.status === 404) {
              ToastService.warning("El registro ya había sido eliminado.");
              await this._cargarTabla();
          } else {
              ToastService.error("Error al eliminar técnico.");
          }
      }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  _getRole() {
    try {
        const token = tokenStorage.getToken();
        const payload = JSON.parse(decodeURIComponent(escape(atob(token.split(".")[1]))));
        return payload?.role || 'user';
    } catch { return 'user'; }
  }

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