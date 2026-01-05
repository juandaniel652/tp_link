// validacion_token.js
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    // Redirige al login si no hay token
    window.location.replace("https://loginagenda.netlify.app/");
    return;
  }

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

    // Opcional: mostrar email en algún lugar del header
    const emailEl = document.getElementById("userEmail");
    if (emailEl) emailEl.textContent = user.email;

  } catch (err) {
    // Token inválido o expirado → redirige al login
    localStorage.removeItem("access_token");
    window.location.replace("https://loginagenda.netlify.app/");
  }
});
