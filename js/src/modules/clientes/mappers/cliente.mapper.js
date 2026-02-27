import { Cliente } from "../model/cliente.model.js";

export function mapClienteFromApi(dto) {
  return new Cliente({
    id: dto.id,
    numeroCliente: dto.numero_cliente,
    nombre: dto.nombre,
    apellido: dto.apellido,
    telefono: dto.telefono,
    domicilio: dto.domicilio,
    numeroDomicilio: dto.numero_domicilio,
    email: dto.email
  });
}

export function mapClienteToApi(cliente) {
  return {
    numero_cliente: cliente.numeroCliente,
    nombre: cliente.nombre,
    apellido: cliente.apellido,
    telefono: cliente.telefono,
    domicilio: cliente.domicilio,
    numero_domicilio: Number(cliente.numeroDomicilio),
    email: cliente.email
  };
}