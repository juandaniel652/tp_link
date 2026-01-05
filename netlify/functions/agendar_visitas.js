export async function handler(event) {
  try {
    // Aceptar solo POST
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Método no permitido" }),
      };
    }

    // Parsear datos recibidos
    const body = JSON.parse(event.body || "{}");

    const { nombre, mensaje } = body;

    if (!nombre || !mensaje) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Faltan datos obligatorios" }),
      };
    }

    // Aquí podés agregar lógica de base de datos o enviar a otra API
    console.log("Nuevo turno recibido:", mensaje);

    // En el futuro: fetch hacia servidor externo o DB aquí

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        mensaje: "Ticket recibido correctamente",
        datos: mensaje,
      }),
    };
  } catch (error) {
    console.error("Error en backend:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error interno del servidor" }),
    };
  }
}
