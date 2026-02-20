const API_URL =
"https://agenda-1-zomu.onrender.com/api/v1";


// =====================
// GET TURNOS
// =====================

export async function getTurnos() {

  const res =
    await fetch(`${API_URL}/turnos`);

  if (!res.ok)
    throw new Error("Error cargando turnos");

  return await res.json();

}


// =====================
// CREAR TURNO
// =====================

export async function crearTurno(turno) {

  const res =
    await fetch(`${API_URL}/turnos`, {

      method: "POST",

      headers: {

        "Content-Type": "application/json",

        "Authorization":
          "Bearer " +
          localStorage.getItem("token")

      },

      body:
        JSON.stringify(turno)

    });

  if (!res.ok) {

    const error =
      await res.text();

    throw new Error(error);

  }

  return await res.json();

}


// =====================
// DELETE
// =====================

export async function eliminarTurno(id) {

  const res =
    await fetch(
      `${API_URL}/turnos/${id}`,
      { method: "DELETE" }
    );

  if (!res.ok)
    throw new Error("Error eliminando");

}
