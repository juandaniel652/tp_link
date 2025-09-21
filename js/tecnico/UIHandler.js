import Tecnico from "./Tecnico.js"; 

export default class UIHandler {
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

    this.horariosContainer = document.getElementById("diasHorarioGrid");
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

    // Normalizar duración a múltiplos de 15
    this.inputs.duracion.addEventListener("blur", () => {
      let minutos = parseInt(this.inputs.duracion.value, 10) || 0;
      minutos = Math.round(minutos / 15) * 15;
      this.inputs.duracion.value = minutos;
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
    if (value.length > 2 && value.length <= 6)
      value = value.replace(/^(\d{2})(\d{0,4})$/, "$1 $2");
    else if (value.length > 6)
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*$/, "$1 $2-$3");
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

  limpiarFormulario() {
    Object.values(this.inputs).forEach((input) => (input.value = ""));
    Object.values(this.errors).forEach((span) => (span.textContent = ""));
    this.indiceEdicion = null;
    this.formulario.querySelector("button[type='submit']").textContent =
      "Guardar Técnico";

    this.horariosContainer.querySelectorAll("input[type=checkbox]").forEach(
      (chk) => (chk.checked = false)
    );
    this.horariosContainer.querySelectorAll("input[type=time]").forEach(
      (t) => (t.value = "")
    );
  }

  _renderHorariosDisponibles() {
    const dias = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
    this.horariosContainer.innerHTML = "";

    dias.forEach((dia) => {
      const row = document.createElement("div");
      row.className = "dia-row";

      // Checkbox del día
      const chk = document.createElement("input");
      chk.type = "checkbox";
      chk.dataset.dia = dia;

      const label = document.createElement("label");
      label.textContent = dia;
      label.style.width = "80px";
      label.style.fontWeight = "bold";

      // Horario de inicio
      const inicio = document.createElement("input");
      inicio.type = "time";
      inicio.min = "09:00";
      inicio.max = "18:00";
      inicio.step = "900"; // intervalos de 15 min
      inicio.value = "09:00";
      inicio.dataset.tipo = "inicio";
      inicio.disabled = true;

      // Horario de fin
      const fin = document.createElement("input");
      fin.type = "time";
      fin.min = "09:00";
      fin.max = "18:00";
      fin.step = "900"; // intervalos de 15 min
      fin.value = "18:00";
      fin.dataset.tipo = "fin";
      fin.disabled = true;

      // Normalizar inicio y fin al cambiar (siempre saltos de 15 min)
      ;[inicio, fin].forEach((input) => {
        input.addEventListener("change", () => {
          let [h, m] = input.value.split(":").map(Number);

          // Redondear minutos a múltiplos de 15
          m = Math.round(m / 15) * 15;
          if (m === 60) {
            h += 1;
            m = 0;
          }

          // Limitar dentro de rango laboral
          if (h < 9) { h = 9; m = 0; }
          if (h > 18) { h = 18; m = 0; }

          input.value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        });
      });

      // Habilitar/deshabilitar horas según selección del día
      chk.addEventListener("change", () => {
        inicio.disabled = fin.disabled = !chk.checked;
      });

      row.appendChild(chk);
      row.appendChild(label);
      row.appendChild(inicio);
      row.appendChild(fin);

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
      const horariosStr = r.horarios
        ? r.horarios
            .map((h) => `${h.dia}: ${h.inicio} - ${h.fin}`)
            .join("<br>")
        : "";

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
      tr.querySelector(".edit").addEventListener("click", () =>
        this._editarTecnico(index)
      );
      tr.querySelector(".delete").addEventListener("click", () =>
        this._eliminarTecnico(index)
      );

      this.contenedor.appendChild(tr);
    });
  }

  _recopilarDatosFormulario() {
    const horarios = [...this.horariosContainer.querySelectorAll(".dia-row")]
      .filter((row) => row.querySelector("input[type=checkbox]").checked)
      .map((row) => {
        const dia = row.querySelector("input[type=checkbox]").dataset.dia;
        const inicio = row.querySelector("input[data-tipo=inicio]").value;
        const fin = row.querySelector("input[data-tipo=fin]").value;

        // Validación: inicio < fin
        if (inicio >= fin) {
          alert(`En ${dia}, la hora de inicio debe ser menor que la de fin`);
          throw new Error("Horario inválido");
        }

        return { dia, inicio, fin };
      });

    return new Tecnico({
      nombre: this.inputs.nombre.value,
      apellido: this.inputs.apellido.value,
      telefono: this.inputs.telefono.value,
      duracionTurnoMinutos: this.inputs.duracion.value,
      horarios,
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

    try {
      const tecnico = this._recopilarDatosFormulario();

      if (this.indiceEdicion !== null) {
        this.manager.actualizar(this.indiceEdicion, tecnico);
      } else {
        this.manager.agregar(tecnico);
      }

      this.limpiarFormulario();
      this.renderTabla();
    } catch (e) {
      console.warn("Error al guardar técnico:", e.message);
    }
  }

  _editarTecnico(index) {
    this.indiceEdicion = index;
    const registro = this.manager.obtenerTodos()[index];

    this.inputs.nombre.value = registro.nombre;
    this.inputs.apellido.value = registro.apellido;
    this.inputs.telefono.value = registro.telefono;
    this.inputs.duracion.value = registro.duracionTurnoMinutos;

    this.horariosContainer
      .querySelectorAll(".dia-row")
      .forEach((row) => {
        const chk = row.querySelector("input[type=checkbox]");
        const dia = chk.dataset.dia;
        const horario = registro.horarios.find((h) => h.dia === dia);

        if (horario) {
          chk.checked = true;
          row.querySelector("input[data-tipo=inicio]").disabled = false;
          row.querySelector("input[data-tipo=fin]").disabled = false;
          row.querySelector("input[data-tipo=inicio]").value = horario.inicio;
          row.querySelector("input[data-tipo=fin]").value = horario.fin;
        } else {
          chk.checked = false;
          row.querySelector("input[data-tipo=inicio]").disabled = true;
          row.querySelector("input[data-tipo=fin]").disabled = true;
        }
      });

    this.formulario.querySelector("button[type='submit']").textContent =
      "Guardar Cambios";
    this.formulario.scrollIntoView({ behavior: "smooth" });
  }

  _eliminarTecnico(index) {
    const tecnico = this.manager.obtenerTodos()[index];
    if (
      confirm(`¿Seguro que quieres eliminar a ${tecnico.nombre} ${tecnico.apellido}?`)
    ) {
      this.manager.eliminar(index);
      this.renderTabla();
    }
  }
}
