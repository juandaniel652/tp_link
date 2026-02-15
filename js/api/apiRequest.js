// js/api/apiRequest.js
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("access_token"); // mismo que login

  if (!token) {
    window.location.href = "/html/login.html"; // redirigir si no hay token
    throw new Error("No autenticado");
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    ...options.headers
  };

  const response = await fetch(`https://agenda-1-zomu.onrender.com/api/v1${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || error.message);


  }

  return response.json();
}
