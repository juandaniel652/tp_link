// modules/tecnicos/service/tecnicos.service.js
import { tecnicosApi }          from "./tecnicos.api.js";
import { fromApi, toFormData }  from "../mappers/tecnicos.mapper.js";

export default class TecnicosService {

  static async obtenerTodos() {
    const data = await tecnicosApi.obtenerTodos();
    console.log("RAW API:", JSON.stringify(data[0], null, 2));  // <-- agrega
    return data.map(fromApi);
  }

  static async obtenerPorId(id) {
    const data = await tecnicosApi.obtenerPorId(id);
    return fromApi(data);
  }

  static crear(payload) {
    return tecnicosApi.crear(toFormData(payload));
  }

  static actualizar(id, payload) {
    return tecnicosApi.actualizar(id, toFormData(payload));
  }

  static eliminar(id) {
    return tecnicosApi.eliminar(id);
  }
}