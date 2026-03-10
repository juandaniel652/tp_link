// ============================================================
// andros.service.js — Integración con API externa Andros
// ============================================================
// Extraído de grilla.js → obtenerClienteYValidar()
// ============================================================

import { ANDROS_API_URL } from "./turnos.constants.js";
import { ClienteSinDatosError } from "./errors.js";

/**
 * Busca un cliente primero en el listado local; si no existe,
 * lo consulta a la API de Andros y lo agrega al arreglo local.
 *
 * @param {Object[]}     clientes  — array local de clientes (se muta si se agrega)
 * @param {string|number} clienteId
 * @returns {Promise<Object>} cliente encontrado o construido desde Andros
 * @throws {ClienteSinDatosError} si clienteId es nulo/vacío
 */
export async function resolverCliente(clientes, clienteId) {
  if (!clienteId) {
    throw new ClienteSinDatosError(clienteId);
  }

  // 1. Búsqueda local
  const local = clientes.find(c => String(c.id) === String(clienteId));
  if (local) return local;

  // 2. Consulta a Andros
  console.log(`🔎 Cliente ${clienteId} no encontrado localmente. Consultando Andros...`);

  try {
    const response = await fetch(`${ANDROS_API_URL}${clienteId}`);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    const clienteAndros = {
      id:             data.id    ?? clienteId,
      numero_cliente: data.id    ?? clienteId,
      nombre:         data.nombre   ?? "Sin nombre",
      apellido:       data.apellido ?? "",
      direccion:      data.direccion ?? "",
      telefono:       data.telefono  ?? "",
      fuente:         "Andros",
    };

    console.log("✅ Cliente recuperado desde Andros:", clienteAndros);

    // Cachear en el array local para reutilizar en la sesión
    clientes.push(clienteAndros);

    return clienteAndros;

  } catch (error) {
    console.warn("⚠️ No se pudo obtener cliente desde Andros:", error);

    // Devolver un cliente fantasma en lugar de romper el flujo
    const clienteFallback = {
      id:             clienteId,
      numero_cliente: clienteId,
      nombre:         "Cliente externo",
      apellido:       "(sin datos)",
      fuente:         "Andros-fallback",
    };

    clientes.push(clienteFallback);
    return clienteFallback;
  }
}