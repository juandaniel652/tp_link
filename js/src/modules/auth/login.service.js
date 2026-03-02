const API_BASE_URL = "https://agenda-uipe.onrender.com/api/v1";

export async function loginRequest(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Credenciales inválidas");
  }

  return response.json();
}