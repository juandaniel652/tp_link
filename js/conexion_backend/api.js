export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    window.location.href = "https://loginagenda.netlify.app/";
    return;
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers
  };

  const response = await fetch(
    `https://agenda-1-zomu.onrender.com/api/v1${endpoint}`,
    {
      ...options,
      headers
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Error de servidor");
  }

  return response.json();
}
