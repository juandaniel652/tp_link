export async function apiRequest(endpoint, options = {}) {

  const token = localStorage.getItem("access_token");

  if (!token) {
    window.location.href = "/html/login.html";
    throw new Error("No autenticado");
  }

  const headers = {
  "Authorization": `Bearer ${token}`,
  ...options.headers
  };
  
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Detectar tipo de body
  if (options.body) {

    // Si es FormData → NO tocar Content-Type
    if (options.body instanceof FormData) {
      // el browser agrega multipart/form-data automáticamente
    }

    // Si es JSON object → convertir a string
    else if (typeof options.body === "object") {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(options.body);
    }

  }

  const response = await fetch(
    `https://agenda-1-zomu.onrender.com/api/v1${endpoint}`,
    {
      ...options,
      headers
    }
  );

  if (!response.ok) {

    const error = await response.json().catch(() => ({}));

    console.error("API ERROR:", error);

    throw error;
  }

  return response.json();
}
