import {
  fetchClientes,
  createCliente,
  updateCliente,
  deleteCliente
} from "./clientes.api.js";

import {
  mapClienteFromApi,
  mapClienteToApi
} from "../mappers/cliente.mapper.js";

export async function obtenerClientes(token) {
  const data = await fetchClientes(token);
  return data.map(mapClienteFromApi);
}

export async function crearCliente(cliente, token) {
  const payload = mapClienteToApi(cliente);
  const created = await createCliente(payload, token);
  return mapClienteFromApi(created);
}

export async function actualizarCliente(cliente, token) {
  const payload = mapClienteToApi(cliente);
  const updated = await updateCliente(cliente.id, payload, token);
  return mapClienteFromApi(updated);
}

export async function eliminarCliente(id, token) {
  return deleteCliente(id, token);
}