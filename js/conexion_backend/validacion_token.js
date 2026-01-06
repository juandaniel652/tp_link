// js/conexion_backend/validacion_token.js

document.addEventListener("DOMContentLoaded", async () => {
  console.log("validacion_token.js CARGADO");

  const token = localStorage.getItem("access_token");

  if (!token) {
    console.warn("No hay token, redirigiendo a login");
    window.location.replace("https://loginagenda.netlify.app/");
    return;
  }

  try {
    const response = await fetch(
      "https://agenda-uipe.onrender.com/api/v1/auth/me",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Token inválido o expirado");
    }

    const user = await response.json();
    console.log("Usuario autenticado:", user);

    // Mostrar email si existe el elemento
    const emailEl = document.getElementById("userEmail");
    if (emailEl) {
      emailEl.textContent = user.email;
    }

  } catch (error) {
    console.error("Error de autenticación:", error);
    localStorage.removeItem("access_token");
    window.location.replace("https://loginagenda.netlify.app/");
  }
});
