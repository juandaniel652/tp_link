import { requireAuth } from "@/core/auth/token.guard.js";
export async function bootstrapProtectedPage(initFunction) {

  const isAuthenticated = await requireAuth();
  if (!isAuthenticated) return;

  initFunction();
}