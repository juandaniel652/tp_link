const token = localStorage.getItem("access_token");

  if (!token) {
    // Si no hay token, redirige al login centralizado
    window.location.href = "https://loginagenda.netlify.app/"; // o donde esté el login
  }

  async function fetchUser() {
    try {
      const response = await fetch("https://agenda-uipe.onrender.com/api/v1/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Token inválido");

      const user = await response.json();
      console.log("Usuario logueado:", user);

      // Aquí podrías mostrar info del usuario o condicionar botones
      document.getElementById("userEmail").textContent = user.email;
    } catch (err) {
      // Token inválido o expirado → redirige al login
      localStorage.removeItem("access_token");
      window.location.href = "https://loginagenda.netlify.app/";
    }
  }

  fetchUser();