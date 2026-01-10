// js/agenda/auth.js
export function getAuthHeaders() {
  const token = localStorage.getItem("access_token");

  if (!token) return {};

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };
}
