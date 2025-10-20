export async function enviarTicket() {
  // 1️⃣ Armar objeto con los datos del formulario
  const data = {
    nombre: "Agenda",
    mensaje: {
      id_cliente: document.getElementById("selectCliente").value,
      ticket_id: document.getElementById("selectTicket").value,
      tecnico: document.getElementById("selectTecnico").value,
      tipo_turno: document.getElementById("selectT").value,
      rango_horario: document.getElementById("selectRango").value,
      estado: document.getElementById("selectEstadoTicket").value,
      fecha_envio: new Date().toISOString()
    }
  };

  // 2️⃣ Validar que no haya campos vacíos
  const mensaje = data.mensaje;
  for (let key in mensaje) {
    if (!mensaje[key]) {
      alert(`⚠️ Por favor completa el campo: ${key}`);
      return;
    }
  }

  // 3️⃣ Hacer fetch al backend (proxy)
  try {
    const response = await fetch("https://fenixsi-backend.onrender.com/api/ticket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    // 4️⃣ Leer la respuesta
    const text = await response.text();

    // 5️⃣ Intentar parsear como JSON
    let json;
    try {
      json = JSON.parse(text);
      console.log("✅ Respuesta JSON del servidor:", json);
      alert(`✅ Ticket enviado correctamente: ${json.mensaje || 'Sin mensaje del servidor'}`);
    } catch {
      console.warn("⚠️ La respuesta no es JSON. Texto recibido:", text);
      alert("✅ Ticket enviado correctamente (respuesta no JSON del servidor). Revisa la consola.");
    }

  } catch (error) {
    console.error("❌ Error al enviar el ticket:", error);
    alert("❌ Error al enviar el ticket. Revisa la consola para más detalles.");
  }
}