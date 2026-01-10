const API_URL = 'https://agenda-uipe.onrender.com/api/v1/clientes';

export class ClienteService {

  static async obtenerTodos(token) {
    const res = await fetch(API_URL + '/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error('Error al obtener clientes');
    return res.json();
  }

  static async crear(cliente, token) {
    const res = await fetch(API_URL + '/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(cliente)
    });

    if (!res.ok) throw new Error('Error al crear cliente');
    return res.json();
  }

  static async eliminar(id, token) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error('Error al eliminar cliente');
  }

  static async actualizar(id, cliente, token) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(cliente)
    });

    if (!res.ok) throw new Error('Error al actualizar cliente');
    return res.json();
  }
}
