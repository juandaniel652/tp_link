// ✅ envioTicketPOST.js
export async function enviarTicket(turno) {
  // 🧩 Normalizar claves esperadas por el backend
  turno.id_cliente = turno.id_cliente || turno.clienteId || turno.numeroCliente || "N/A";

  // 1️⃣ Validar campos requeridos
  const camposRequeridos = ["id_cliente", "ticket_id", "tecnico", "tipo_turno", "rango_horario", "estado"];
  const faltantes = camposRequeridos.filter(campo => !turno[campo] || turno[campo] === "N/A");

  if (faltantes.length > 0) {
    alert(`⚠️ Por favor completa los siguientes campos: ${faltantes.join(", ")}`);
    console.warn("Turno incompleto:", turno);
    return;
  }

  // 2️⃣ Armar el objeto a enviar
  const data = {
    nombre: "Agenda",
    mensaje: {
      ...turno,
      fecha_envio: new Date().toISOString()
    }
  };

  // 3️⃣ Enviar al backend
  try {
    const response = await fetch("https://fenixsi-backend.onrender.com/api/ticket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const text = await response.text();

    try {
      const json = JSON.parse(text);
      console.log("✅ Respuesta JSON del servidor:", json);
      alert(`✅ Ticket enviado correctamente: ${json.mensaje || "Sin mensaje del servidor"}`);
    } catch {
      console.warn("⚠️ La respuesta no es JSON. Texto recibido:", text);
      alert("✅ Ticket enviado correctamente (respuesta no JSON del servidor). Revisa la consola.");
    }

  } catch (error) {
    console.error("❌ Error al enviar el ticket:", error);
    alert("❌ Error al enviar el ticket. Revisa la consola para más detalles.");
  }
}
