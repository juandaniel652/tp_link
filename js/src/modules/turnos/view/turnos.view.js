export class TurnosView {

  getSearchString() {
    return window.location.search;
  }

  applyParamsToSelects({ clienteId, ticketId }) {
    const selectCliente = document.getElementById("selectCliente");
    const selectTicket = document.getElementById("selectTicket");

    if (selectCliente && clienteId) {
      this.selectOrCreateOption(selectCliente, clienteId);
    }

    if (selectTicket && ticketId) {
      this.selectOrCreateOption(selectTicket, ticketId, `Ticket ${ticketId}`);
    }
  }

  selectOrCreateOption(selectElement, value, label = value) {
    const existingOption = Array.from(selectElement.options)
      .find(opt => opt.value == value);

    if (existingOption) {
      selectElement.value = value;
      return;
    }

    const newOption = document.createElement("option");
    newOption.value = value;
    newOption.textContent = label;
    newOption.selected = true;

    selectElement.appendChild(newOption);
  }

  setLoading(isLoading) {
      const spinner = document.getElementById("spinner");
      if (!spinner) return;
    
      spinner.style.display = isLoading ? "block" : "none";
    }
    
    renderError(error) {
      const errorBox = document.getElementById("errorBox");
      if (!errorBox) return;
    
      if (!error) {
        errorBox.textContent = "";
        return;
      }
  
      errorBox.textContent = error.message;
    }
}