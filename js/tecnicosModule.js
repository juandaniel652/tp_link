document.addEventListener("DOMContentLoaded", () => {
  /** =====================
   *  Servicio de almacenamiento
   *  ===================== */
  class StorageService {
    static get(key) {
      return JSON.parse(localStorage.getItem(key)) || [];
    }

    static set(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  /** =====================
   *  Modelo de Técnico
   *  ===================== */
  class Tecnico {
    constructor({ nombre, apellido, telefono, duracionTurnoMinutos, horarios = [] }) {
      this.nombre = nombre.trim();
      this.apellido = apellido.trim();
      this.telefono = telefono.trim();
      this.duracionTurnoMinutos = duracionTurnoMinutos.trim();
      this.horarios = Array.isArray(horarios) ? horarios : [];
    }

    static validarCampo(campo, valor) {
      const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
      const telRegex = /^([0-9]{2})\s([0-9]{4})-([0-9]{4})$/;
      const duracion = Number(valor);

      switch (campo) {
        case "nombre":
        case "apellido":
          return valor && soloLetras.test(valor) ? "" : "Solo se permiten letras (sin números).";
        case "telefono":
          return telRegex.test(valor) ? "" : "Formato válido: 11 1234-5678";
        case "duracionTurnoMinutos":
          if (isNaN(duracion) || duracion <= 0) return "Debe ser un número mayor que 0.";
          if (duracion > 90) return "Máximo permitido es 90 minutos.";
          if (duracion % 5 !== 0) return "Debe ser múltiplo de 5.";
          return "";
        default:
          return "";
      }
    }

    static validar(tecnico) {
      return (
        !this.validarCampo("nombre", tecnico.nombre) &&
        !this.validarCampo("apellido", tecnico.apellido) &&
        !this.validarCampo("telefono", tecnico.telefono) &&
        !this.validarCampo("duracionTurnoMinutos", tecnico.duracionTurnoMinutos)
      );
    }
  }

  /** =====================
   *  Gestor de Técnicos
   *  ===================== */
  class TecnicoManager {
    constructor(storageKey = "tecnicos") {
      this.storageKey = storageKey;
      this.tecnicos = StorageService.get(this.storageKey);
    }

    obtenerTodos() {
      return this.tecnicos;
    }

    agregar(tecnico) {
      this.tecnicos.push(tecnico);
      this.guardar();
    }

    actualizar(indice, tecnico) {
      this.tecnicos[indice] = tecnico;
      this.guardar();
    }

    eliminar(indice) {
      this.tecnicos.splice(indice, 1);
      this.guardar();
    }

    guardar() {
      StorageService.set(this.storageKey, this.tecnicos);
    }
  }

  /** =====================
   *  UI / Interfaz
   *  ===================== */
  class UIHandler {
    constructor(formSelector, tableContainerSelector, manager) {
      this.formulario = document.querySelector(formSelector);
      this.contenedor = document.querySelector(tableContainerSelector);
      this.manager = manager;
      this.indiceEdicion = null;

      this.inputs = {
        nombre: document.getElementById("nombre"),
        apellido: document.getElementById("apellido"),
        telefono: document.getElementById("telefono"),
        duracion: document.getElementById("duracionTurno"),
      };

      this.horariosContainer = document.getElementById("diasHorarioGrid"); // <--- id correcto
      this.errors = {};

      this._crearMensajesError();
      this._registrarEventos();
      this._renderHorariosDisponibles();
    }

    _crearMensajesError() {
      Object.keys(this.inputs).forEach((key) => {
        let span = document.createElement("span");
        span.className = "error-msg";
        span.style.color = "red";
        span.style.fontSize = "0.85em";
        span.style.display = "block";
        span.style.marginTop = "2px";
        this.inputs[key].insertAdjacentElement("afterend", span);
        this.errors[key] = span;
      });
    }

    _registrarEventos() {
      Object.entries(this.inputs).forEach(([key, input]) => {
        input.addEventListener("input", () => {
          if (key === "telefono") this._formatearTelefono(input);
          this._validarCampoIndividual(key, input.value);
        });

        input.addEventListener("beforeinput", (e) => {
          if (!this._esEntradaValida(key, e.data)) e.preventDefault();
        });
      });

      this.formulario.addEventListener("submit", (e) => {
        e.preventDefault();
        this._guardarTecnico();
      });
    }

    _esEntradaValida(campo, caracter) {
      if (!caracter) return true;
      const letras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]$/;
      const numeros = /^\d$/;

      switch (campo) {
        case "nombre":
        case "apellido":
          return letras.test(caracter);
        case "telefono":
        case "duracion":
          return numeros.test(caracter);
        default:
          return true;
      }
    }

    _formatearTelefono(input) {
      let value = input.value.replace(/\D/g, "");
      if (!value.startsWith("11")) value = "11" + value.slice(0, 8);
      if (value.length > 2 && value.length <= 6) value = value.replace(/^(\d{2})(\d{0,4})$/, "$1 $2");
      else if (value.length > 6) value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*$/, "$1 $2-$3");
      input.value = value;
    }

    _validarCampoIndividual(campo, valor) {
      const errorMsg = Tecnico.validarCampo(campo === "duracion" ? "duracionTurnoMinutos" : campo, valor);
      this.errors[campo].textContent = errorMsg;
      return !errorMsg;
    }

    limpiarFormulario() {
      Object.values(this.inputs).forEach(input => (input.value = ""));
      Object.values(this.errors).forEach(span => (span.textContent = ""));
      this.indiceEdicion = null;
      this.formulario.querySelector("button[type='submit']").textContent = "Guardar Técnico";

      // Desactivar todos los botones AM/PM
      document.querySelectorAll(".range-btn.active").forEach(btn => btn.classList.remove("active"));
    }

    /** Render de botones AM/PM por día */
    _renderHorariosDisponibles() {
      const dias = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
      const rangos = ["AM","PM"];
      this.horariosContainer.innerHTML = "";

      dias.forEach(dia => {
        const row = document.createElement("div");
        row.className = "dia-row";

        const label = document.createElement("div");
        label.className = "dia-name";
        label.textContent = dia;
        row.appendChild(label);

        rangos.forEach(rango => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "range-btn";
          btn.dataset.dia = dia;
          btn.dataset.rango = rango;
          btn.textContent = rango;

          btn.addEventListener("click", () => btn.classList.toggle("active"));
          row.appendChild(btn);
        });

        this.horariosContainer.appendChild(row);
      });
    }

    renderTabla() {
      this.contenedor.innerHTML = "";
      const tecnicos = this.manager.obtenerTodos();

      if (tecnicos.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="5" class="no-data">No hay registros</td>`;
        this.contenedor.appendChild(tr);
        return;
      }

      tecnicos.forEach((r, index) => {
        const horariosStr = r.horarios ? r.horarios.map(h => `${h.dia} ${h.rango}`).join(", ") : "";

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td data-label="Nombre">${r.nombre}</td>
          <td data-label="Apellido">${r.apellido}</td>
          <td data-label="Teléfono">${r.telefono}</td>
          <td data-label="Duración turno">${r.duracionTurnoMinutos}</td>
          <td data-label="Horarios">${horariosStr}</td>
          <td data-label="Acciones" class="actions">
            <button class="btn-action edit">✏️</button>
            <button class="btn-action delete">🗑️</button>
          </td>
        `;
        tr.querySelector(".edit").addEventListener("click", () => this._editarTecnico(index));
        tr.querySelector(".delete").addEventListener("click", () => this._eliminarTecnico(index));

        this.contenedor.appendChild(tr);
      });
    }

    _recopilarDatosFormulario() {
      const horarios = [...document.querySelectorAll(".range-btn.active")].map(btn => ({
        dia: btn.dataset.dia,
        rango: btn.dataset.rango
      }));

      return new Tecnico({
        nombre: this.inputs.nombre.value,
        apellido: this.inputs.apellido.value,
        telefono: this.inputs.telefono.value,
        duracionTurnoMinutos: this.inputs.duracion.value,
        horarios
      });
    }

    _guardarTecnico() {
      let valido = true;
      let errores = [];

      Object.entries(this.inputs).forEach(([key, input]) => {
        if (!this._validarCampoIndividual(key, input.value)) {
          valido = false;
          errores.push(key);
        }
      });

      if (!valido) {
        alert("Revisa los campos: " + errores.join(", "));
        return;
      }

      const tecnico = this._recopilarDatosFormulario();

      if (this.indiceEdicion !== null) {
        this.manager.actualizar(this.indiceEdicion, tecnico);
      } else {
        this.manager.agregar(tecnico);
      }

      this.limpiarFormulario();
      this.renderTabla();
    }

    _editarTecnico(index) {
      this.indiceEdicion = index;
      const registro = this.manager.obtenerTodos()[index];

      this.inputs.nombre.value = registro.nombre;
      this.inputs.apellido.value = registro.apellido;
      this.inputs.telefono.value = registro.telefono;
      this.inputs.duracion.value = registro.duracionTurnoMinutos;

      // Activar los botones AM/PM según los horarios guardados
      document.querySelectorAll(".range-btn").forEach(btn => {
        const existe = registro.horarios.some(h => h.dia === btn.dataset.dia && h.rango === btn.dataset.rango);
        btn.classList.toggle("active", existe);
      });

      this.formulario.querySelector("button[type='submit']").textContent = "Guardar Cambios";
      this.formulario.scrollIntoView({ behavior: "smooth" });
    }

    _eliminarTecnico(index) {
      const tecnico = this.manager.obtenerTodos()[index];
      if (confirm(`¿Seguro que quieres eliminar a ${tecnico.nombre} ${tecnico.apellido}?`)) {
        this.manager.eliminar(index);
        this.renderTabla();
      }
    }
  }

  /** =====================
   *  App Principal
   *  ===================== */
  class App {
    static init() {
      const manager = new TecnicoManager();
      const ui = new UIHandler("#formGeneral", "#generalContainer", manager);

      ui.limpiarFormulario();
      ui.renderTabla();
    }
  }

  App.init();
});
