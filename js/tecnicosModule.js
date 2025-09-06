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
    constructor({ nombre, apellido, telefono, duracionTurnoMinutos, puntosAcceso = [] }) {
      this.nombre = nombre.trim();
      this.apellido = apellido.trim();
      this.telefono = telefono.trim();
      this.duracionTurnoMinutos = duracionTurnoMinutos.trim();
      this.puntosAcceso = Array.isArray(puntosAcceso) ? puntosAcceso : [];
    }

    static validarCampo(campo, valor) {
      const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
      const telRegex = /^([0-9]{2})\s([0-9]{4})-([0-9]{4})$/; // formato argentino
      const duracion = Number(valor);

      switch (campo) {
        case "nombre":
        case "apellido":
          return valor && soloLetras.test(valor)
            ? ""
            : "Solo se permiten letras (sin números).";
        case "telefono":
          return telRegex.test(valor)
            ? ""
            : "Formato válido: 11 1234-5678";
        case "duracionTurnoMinutos":
          if (isNaN(duracion) || duracion <= 0) {
            return "Debe ser un número mayor que 0.";
          }
          if (duracion > 90) {
            return "Máximo permitido es 90 minutos.";
          }
          if (duracion % 5 !== 0) {
            return "Debe ser múltiplo de 5.";
          }
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
    constructor(formSelector, tableContainerSelector, chipsContainerSelector, manager) {
      this.formulario = document.querySelector(formSelector);
      this.contenedor = document.querySelector(tableContainerSelector);
      this.chipsContainer = document.querySelector(chipsContainerSelector);
      this.manager = manager;
      this.indiceEdicion = null;

      this.inputs = {
        nombre: document.getElementById("nombre"),
        apellido: document.getElementById("apellido"),
        telefono: document.getElementById("telefono"),
        duracion: document.getElementById("duracionTurno"),
      };

      this.errors = {}; // referencias a spans de error

      this._crearMensajesError();
      this._registrarEventos();
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
      // Validación inline mientras escribe
      Object.entries(this.inputs).forEach(([key, input]) => {
        input.addEventListener("input", () => {
          if (key === "telefono") {
            this._formatearTelefono(input);
          }
          this._validarCampoIndividual(key, input.value);
        });

        // Restricción directa en el input
        input.addEventListener("beforeinput", (e) => {
          if (!this._esEntradaValida(key, e.data)) {
            e.preventDefault();
          }
        });
      });

      // Validación en el submit
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
      // Forzar que empiece con 11
      if (!value.startsWith("11")) {
      value = "11" + value.slice(0, 8);
      }
      if (value.length > 2 && value.length <= 6) {
      value = value.replace(/^(\d{2})(\d{0,4})$/, "$1 $2");
      } else if (value.length > 6) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*$/, "$1 $2-$3");
      }
      input.value = value;
    }

    _validarCampoIndividual(campo, valor) {
      const errorMsg = Tecnico.validarCampo(
        campo === "duracion" ? "duracionTurnoMinutos" : campo,
        valor
      );
      this.errors[campo].textContent = errorMsg;
      return !errorMsg;
    }

    _mostrarModalError(mensaje) {
      const modal = document.createElement("div");
      modal.className = "modal-error";
      modal.style.position = "fixed";
      modal.style.top = "0";
      modal.style.left = "0";
      modal.style.width = "100%";
      modal.style.height = "100%";
      modal.style.backgroundColor = "rgba(0,0,0,0.5)";
      modal.style.display = "flex";
      modal.style.alignItems = "center";
      modal.style.justifyContent = "center";
      modal.style.zIndex = "1000";

      const box = document.createElement("div");
      box.style.background = "#fff";
      box.style.padding = "20px";
      box.style.borderRadius = "8px";
      box.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";
      box.style.maxWidth = "400px";
      box.style.textAlign = "center";
      box.innerHTML = `
        <h3 style="margin:0 0 10px;color:#c0392b">Error en el formulario</h3>
        <p style="margin:0 0 20px">${mensaje}</p>
        <button id="cerrarModal">Aceptar</button>
      `;

      modal.appendChild(box);
      document.body.appendChild(modal);

      modal.querySelector("#cerrarModal").addEventListener("click", () => {
        document.body.removeChild(modal);
      });
    }

    cargarPuntosAcceso() {
      const puntos = StorageService.get("puntosAcceso");
      this.chipsContainer.innerHTML = "";

      puntos.forEach((puntoObj) => {
        const label = document.createElement("label");
        label.classList.add("chip");

        const input = document.createElement("input");
        input.type = "checkbox";
        input.value = String(puntoObj.numero);

        const span = document.createElement("span");
        span.textContent = `NAP ${puntoObj.numero}`;

        label.appendChild(input);
        label.appendChild(span);
        this.chipsContainer.appendChild(label);
      });
    }

    limpiarFormulario() {
      this.inputs.nombre.value = "";
      this.inputs.apellido.value = "";
      this.inputs.telefono.value = "";
      this.inputs.duracion.value = "";
      Object.values(this.errors).forEach((span) => (span.textContent = ""));
      [...this.chipsContainer.querySelectorAll("input[type='checkbox']")].forEach(
        (chk) => (chk.checked = false)
      );
      this.indiceEdicion = null;
      this.formulario.querySelector("button[type='submit']").textContent = "Guardar Técnico";
    }

    renderTabla() {
      this.contenedor.innerHTML = "";
      const tecnicos = this.manager.obtenerTodos();

      if (tecnicos.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="6" class="no-data">No hay registros</td>`;
        this.contenedor.appendChild(tr);
        return;
      }

      tecnicos.forEach((r, index) => {
        const tr = document.createElement("tr");
        const naps = Array.isArray(r.puntosAcceso) ? r.puntosAcceso.join(", ") : "";

        tr.innerHTML = `
          <td data-label="Nombre">${r.nombre}</td>
          <td data-label="Apellido">${r.apellido}</td>
          <td data-label="Teléfono">${r.telefono}</td>
          <td data-label="Duración turno">${r.duracionTurnoMinutos}</td>
          <td data-label="Puntos de acceso">${naps}</td>
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
      return new Tecnico({
        nombre: this.inputs.nombre.value,
        apellido: this.inputs.apellido.value,
        telefono: this.inputs.telefono.value,
        duracionTurnoMinutos: this.inputs.duracion.value,
        puntosAcceso: [...this.chipsContainer.querySelectorAll("input[type='checkbox']:checked")].map(
          (chk) => chk.value
        ),
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
        this._mostrarModalError("Revisa los campos: " + errores.join(", "));
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

      [...this.chipsContainer.querySelectorAll("input[type='checkbox']")].forEach(
        (chk) => (chk.checked = registro.puntosAcceso.includes(chk.value))
      );

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
      const ui = new UIHandler("#formGeneral", "#generalContainer", "#puntosAcceso", manager);

      ui.cargarPuntosAcceso();
      ui.limpiarFormulario();
      ui.renderTabla();
    }
  }

  App.init();
});
