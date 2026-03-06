// js/src/modules/tecnicos/controller/tecnicos.controller.js
import {
  obtenerTecnicos,
  crearTecnico,
  updateTecnico,
  eliminarTecnico
} from "../service/tecnicos.api.js";

export function initTecnicosController({ view, tokenProvider }) {
  let tecnicos = [];
  let editando = null;

  // Inicialización
  async function init() {
    bindEvents();
    await cargar();
  }

  // Eventos
  function bindEvents() {
    view.onSubmit(handleGuardar);
    view.onEdit(handleEditar);
    view.onDelete(handleEliminar);
  }

  // Cargar lista de técnicos
  async function cargar() {
    try {
      const token = tokenProvider.getToken();
      tecnicos = await obtenerTecnicos(token);
      view.render(tecnicos);
    } catch (error) {
      view.showError(error.message);
    }
  }

  // Guardar o actualizar técnico
  async function handleGuardar(data) {
    try {
      const token = tokenProvider.getToken();

      const tecnico = {
        ...data,
        id: editando?.id ?? null,
        activo: true,
        horarios: data.horarios || []
      };

      let tecnicoCreado;

      if (!editando) {
        tecnicoCreado = await crearTecnico(tecnico, token);
      } else {
        tecnicoCreado = await updateTecnico(tecnico, token);
        editando = null;
      }

      view.resetForm();
      await cargar();

    } catch (error) {
      view.showError(error.message);
    }
  }

  // Editar técnico
  function handleEditar(id) {
    const tecnico = tecnicos.find(t => t.id === id);
    if (!tecnico) return;

    editando = tecnico;
    view.fillForm(tecnico);
  }

  // Eliminar técnico
  async function handleEliminar(id) {
    if (!confirm("¿Eliminar técnico?")) return;

    try {
      const token = tokenProvider.getToken();
      await eliminarTecnico(id, token);
      await cargar();
    } catch (error) {
      view.showError(error.message);
    }
  }

  return { init };
}