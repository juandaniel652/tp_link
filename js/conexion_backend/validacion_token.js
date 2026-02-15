document.addEventListener("DOMContentLoaded", async () => {
  const LOGIN_URL = "https://loginagenda.netlify.app/";  // tu frontend de login
  const API_ME = "https://agenda-1-zomu.onrender.com/api/v1/auth/me"; // tu backend Render


  const params = new URLSearchParams(window.location.search);
  const tokenFromUrl = params.get("token");

  if (tokenFromUrl) {
    localStorage.setItem("access_token", tokenFromUrl);
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  const token = localStorage.getItem("access_token");

  if (!token) {
    window.location.replace(LOGIN_URL);
    return;
  }

  try {
    const response = await fetch(API_ME, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Token inválido");

    const user = await response.json();
    console.log("Usuario autenticado:", user);

  } catch (error) {
    localStorage.removeItem("access_token");
    window.location.replace(LOGIN_URL);
  }
});
