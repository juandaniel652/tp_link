document.addEventListener("DOMContentLoaded", () => {
  // Leer parámetros de la URL
  const params = new URLSearchParams(window.location.search);
  const clienteId = params.get("cliente");
  const ticketId = params.get("ticket");

  // Esperar un momento a que turno.js cargue los selects
  setTimeout(() => {
    const selectCliente = document.getElementById("selectCliente");
    const selectTicket = document.getElementById("selectTicket");

    // Si existen los elementos y hay valores
    if (selectCliente && clienteId) {
      // Si el cliente existe entre las opciones, seleccionarlo
      const optionCliente = Array.from(selectCliente.options).find(opt => opt.value == clienteId);
      if (optionCliente) selectCliente.value = clienteId;
      else {
        // Si no está en la lista, lo agregamos
        const nuevaOpcion = document.createElement("option");
        nuevaOpcion.value = clienteId;
        nuevaOpcion.textContent = `${clienteId}`; // Informaciòn de clienteid
        nuevaOpcion.selected = true;
        selectCliente.appendChild(nuevaOpcion);
      }
    }

    if (selectTicket && ticketId) {
      const optionTicket = Array.from(selectTicket.options).find(opt => opt.value == ticketId);
      if (optionTicket) selectTicket.value = ticketId;
      else {
        const nuevaOpcion = document.createElement("option");
        nuevaOpcion.value = ticketId;
        nuevaOpcion.textContent = `Ticket ${ticketId}`; // Informaciòn de ticketid
        nuevaOpcion.selected = true;
        selectTicket.appendChild(nuevaOpcion);
      }
    }
  }, 500); // medio segundo para dar tiempo a que renderSelect... cargue las opciones
});