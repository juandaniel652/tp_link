// modules/tecnicos/service/tecnicos.api.js
import { apiRequest } from "../../../core/api/apiRequest.js";

const BASE = "/tecnicos";

export const tecnicosApi = {
  obtenerTodos: ()          => apiRequest(BASE),
  obtenerPorId: (id)        => apiRequest(`${BASE}/${id}`),
  crear:        (formData)  => apiRequest(BASE,          { method: "POST",   body: formData }),
  actualizar:   (id, formData) => apiRequest(`${BASE}/${id}`, { method: "PUT",    body: formData }),
  eliminar:     (id)        => apiRequest(`${BASE}/${id}`, { method: "DELETE" })
};