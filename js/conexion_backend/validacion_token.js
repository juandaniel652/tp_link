// validacion_token.js
document.addEventListener("DOMContentLoaded", async () => {
  console.log("validacion_token.js CARGADO");

  const LOGIN_URL = "https://loginagenda.netlify.app/";
  const API_ME = "https://login-agenda-backend.onrender.com/api/v1/auth/me";

  // 1️⃣ Capturar token desde la URL (SOLO primera vez)
  const params = new URLSearchParams(window.location.search);
  const tokenFromUrl = params.get("token");

  if (tokenFromUrl) {
    console.log("Token recibido por URL");

    localStorage.setItem("access_token", tokenFromUrl);

    // Limpia la URL (muy importante)
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // 2️⃣ Leer token persistido
  const token = localStorage.getItem("access_token");
  console.log("Token actual:", token);

  if (!token) {
    console.log("No hay token → login");
    window.location.replace(LOGIN_URL);
    return;
  }

  try {
    // 3️⃣ Validar token con backend
    const response = await fetch(API_ME, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Token inválido");
    }

    const user = await response.json();
    console.log("Usuario autenticado:", user);

    // 4️⃣ Uso normal de la app
    const emailEl = document.getElementById("userEmail");
    if (emailEl) emailEl.textContent = user.email;

  } catch (error) {
    console.error("Error de autenticación:", error);

    // 5️⃣ Token inválido → limpiar y volver al login
    localStorage.removeItem("access_token");
    window.location.replace(LOGIN_URL);
  }
});
