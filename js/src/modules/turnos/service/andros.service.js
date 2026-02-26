// andros.service.js
// Servicio puro para extraer parámetros relevantes del querystring

/**
 * Extrae parámetros de cliente y ticket desde un search string
 */
export function extractTurnoParams(search) {
  const params = new URLSearchParams(search);

  return {
    clienteId: params.get("cliente"),
    ticketId: params.get("ticket")
  };
}