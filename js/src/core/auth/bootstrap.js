import { checkAuth } from "@/core/auth/token.guard.js";

export async function bootstrapProtectedPage(initFunction) {

  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) return;

  initFunction();
}