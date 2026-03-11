import { apiRequest } from "../../../core/api/apiRequest.js";

export async function registerUser(email, password) {

  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email,
      password
    })
  });

}