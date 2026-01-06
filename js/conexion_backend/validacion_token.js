// validacion_token.js
document.addEventListener("DOMContentLoaded", async () => {

  // 1️⃣ Capturar token desde la URL (si viene del login)
  const params = new URLSearchParams(window.location.search);
  const tokenFromUrl = params.get("token");

  if (tokenFromUrl) {
    localStorage.setItem("access_token", tokenFromUrl);

    // Limpia la URL para no dejar el token visible
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // 2️⃣ Leer token desde localStorage (ya normalizado)
  const token = localStorage.getItem("access_token");

  if (!token) {
    window.location.replace("https://loginagenda.netlify.app/");
    return;
  }

  try {
    // 3️⃣ Validar token contra el backend
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

    // 4️⃣ Mostrar email (opcional)
    const emailEl = document.getElementById("userEmail");
    if (emailEl) emailEl.textContent = user.email;

  } catch (err) {
    // 5️⃣ Token inválido o expirado
    localStorage.removeItem("access_token");
    window.location.replace("https://loginagenda.netlify.app/");
  }
});
