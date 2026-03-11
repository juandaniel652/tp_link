import { apiRequest } from "../../../core/api/apiRequest.js";

export async function forgotPassword(email) {

  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email })
  });

}

export async function resetPassword(token, password) {

  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password })
  });

}