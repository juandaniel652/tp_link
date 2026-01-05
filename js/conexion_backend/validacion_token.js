// validacion_token.js
const token = localStorage.getItem("access_token");

// Si no hay token → redirige
if (!token) {
  window.location.href = "https://loginagenda.netlify.app/";
}

// Función para validar token
async function fetchUser() {
  try {
    const response = await fetch(
      "https://agenda-uipe.onrender.com/api/v1/auth/me",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("Token inválido");

    const user = await response.json();
    console.log("Usuario logueado:", user);

    // Mostrar email si existe el contenedor
    const emailEl = document.getElementById("userEmail");
    if (emailEl) emailEl.textContent = user.email;

  } catch (err) {
    // Token inválido o expirado → redirige al login
    localStorage.removeItem("access_token");
    window.location.href = "https://loginagenda.netlify.app/";
  }
}

fetchUser();
